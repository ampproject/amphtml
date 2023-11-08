"""Generates validator-generated.js.

This script reads validator.protoascii and reflects over its contents
to generate Javascript. This Javascript consists of Closure-style
classes and enums, as well as a createRules function which
instantiates the data structures specified in validator.protoascii -
the validator rules.

From a Javascript perspective, this approach looks elaborate - you may
wonder why we're not just writing Javascript directly, or why we're
not encoding our rules in JSON or YAML or even, gasp, XML? Besides the
additional type safety that we gain from our approach, it allows us to
share the rule specifications, error codes, etc. between multiple
validator implementations, including an implementation in C++. This
makes it much easier to keep otherwise likely divergent behavior in
sync.
"""

import copy
import hashlib
import json
import os


def UnderscoreToCamelCase(under_score):
  """Helper function which converts under_score names to camelCase.

  In proto buffers, fields have under_scores. In Javascript, fields
  have camelCase.
  Args:
    under_score: A name, segmented by under_scores.
  Returns:
    A name, segmented as camelCase.
  """
  segments = under_score.split('_')
  return '%s%s' % (segments[0], ''.join([s.title() for s in segments[1:]]))


def FindDescriptors(validator_pb2, msg_desc_by_name, enum_desc_by_name):
  """Finds the message and enum descriptors in the file.

  This method finds the message and enum descriptors from a file descriptor;
  it will visit the top-level messages, and within those the enums.

  Args:
    validator_pb2: The proto2 Python module generated from validator.proto.
    msg_desc_by_name: A map of message descriptors, keyed by full_name.
    enum_desc_by_name: A map of enum descriptors, keyed by full name.
  """
  for msg_type in list(validator_pb2.DESCRIPTOR.message_types_by_name.values()):
    msg_desc_by_name[msg_type.full_name] = msg_type
    for enum_type in msg_type.enum_types:
      enum_desc_by_name[enum_type.full_name] = enum_type


class OutputFormatter(object):
  """Helper class for indenting lines."""

  def __init__(self, lines):
    """Initializes the indenter with indent 0."""
    self.lines = lines
    self.indent_by_ = [0]

  def PushIndent(self, indent):
    """Pushes a particular indent onto the stack."""
    self.indent_by_.append(self.indent_by_[-1] + indent)

  def PopIndent(self):
    """Pops a particular indent from the stack, reverting to the previous."""
    self.indent_by_.pop()

  def Line(self, line):
    """Adds a line to self.lines, applying the indent."""
    self.lines.append('%s%s' % (' ' * self.indent_by_[-1], line))


class MessageKey(object):
  """A hashable key for a proto message capturing its type and content.

  Messages of the same type (we use the short type name here, e.g. AttrSpec)
  that serialize to the same byte string are considered the same.
  """

  def __init__(self, proto_message):
    self.type_name = proto_message.DESCRIPTOR.name
    # While it's not strictly necessary to use a digest here, we do so
    # to avoid carrying around the whole serialized string all the time.
    self.digest = hashlib.sha1(proto_message.SerializeToString()).hexdigest()

  def __hash__(self):
    return hash((self.type_name, self.digest))

  def __eq__(self, other):
    return (self.type_name, self.digest) == (other.type_name, other.digest)

  def __ne__(self, other):
    return not self == other


class MessageRegistry(object):
  """Maps from messages to ids, used for de-duplication."""

  def __init__(self):
    # We maintain separate message ids for each type name, e.g. for AttrList,
    # TagSpec, AttrSpec, etc., there are ids 0 - # unique message instances.
    self.next_message_id_by_type_name_ = {}
    # The key for this map is an instance of MessageKey.
    self.message_id_by_message_key_ = {}

    # A bit that keeps track whether a message has been emitted or
    # not.  Strictly speaking, this bit gets flipped when the message
    # is about to be printed - it being true will prevent that
    # something gets printed twice.
    self.is_printed_by_message_key_ = {}

    # References between tag specs in the .protoascii are expressed as
    # tag spec names (see also TagSpecName), so we maintain this special
    # case mapping to resolve them to message ids.
    self.message_id_by_tag_spec_name_ = {}

    # References from tag specs to attr specs in the .protoascii are expressed
    # as attr list names, so we maintain this mapping to resolve them to
    # message ids for the generated Javascript.
    self.message_id_by_attr_list_name_ = {}

    # Interned strings have negative IDs, starting from -1. This makes it
    # easy to distinguish them from other message ids. In the interned_strings_
    # array, they can be found by calculating their index -1 - <string_id>.
    self.interned_strings_ = []
    self.string_id_by_interned_string_ = {}

  def InternString(self, a_string):
    """Interns strings to eliminate duplicates and to refer to them as numbers.

    Args:
      a_string: the string to be interned
    Returns:
      The string id, a negative number -1 to -MAXINT.
    """
    string_id = self.string_id_by_interned_string_.get(a_string, 0)
    if string_id != 0:
      return string_id
    self.interned_strings_.append(a_string)
    string_id = -len(self.interned_strings_)
    self.string_id_by_interned_string_[a_string] = string_id
    return string_id

  def InternedStrings(self):
    """The interned strings which will be emitted into validator-generated.js.

    Returns:
      A list of strings.
    """
    return self.interned_strings_

  def MessageIdForKey(self, message_key):
    """Yields the message id for a key, registering a new one if needed.

    Args:
      message_key: an instance of MessageKey
    Returns:
      The message id - a number.
    """
    message_id = self.message_id_by_message_key_.get(message_key, -1)
    if message_id != -1:
      return message_id
    message_id = self.next_message_id_by_type_name_.get(message_key.type_name,
                                                        0)
    self.next_message_id_by_type_name_[message_key.type_name] = message_id + 1
    self.message_id_by_message_key_[message_key] = message_id
    return message_id

  def MessageReferenceForKey(self, message_key):
    """A message reference is the variable name used in validator-generated.js.

    Args:
      message_key: an instance of MessageKey
    Returns:
      The message reference - a string.
    """
    return '%s_%d' % (message_key.type_name.lower(),
                      self.MessageIdForKey(message_key))

  def MarkPrinted(self, message_key):
    """Marks a message as printed.

    Args:
      message_key: an instance of MessageKey to identify the message
    """
    self.is_printed_by_message_key_[message_key] = True

  def IsPrinted(self, message_key):
    """Whether a message was printed.

    Args:
      message_key: an instance of MessageKey to identify the message.
    Returns:
      a boolean indicating whether the message was printed.
    """
    return message_key in self.is_printed_by_message_key_

  def RegisterTagSpec(self, tag_spec):
    """Registers a tag spec, including for lookups by TagSpecName.

    Args:
      tag_spec: an instance of validator_pb2.TagSpec
    """
    message_id = self.MessageIdForKey(MessageKey(tag_spec))
    self.message_id_by_tag_spec_name_[TagSpecName(tag_spec)] = message_id

  def MessageIdForTagSpecName(self, tag_spec_name):
    """Looks up a message id for a tag spec by TagSpecName.

    Args:
      tag_spec_name: a string - see TagSpecName for computing it.
    Returns:
      The message id - a number.
    """
    return self.message_id_by_tag_spec_name_[tag_spec_name]

  def RegisterAttrList(self, attr_list):
    """Registers an attr list, including for lookups by name.

    Args:
      attr_list: an instance of validator_pb2.AttrList
    """
    message_id = self.MessageIdForKey(MessageKey(attr_list))
    self.message_id_by_attr_list_name_[attr_list.name] = message_id

  def MessageIdForAttrListName(self, attr_list_name):
    """Looks up a message id for a tag spec by AttrListName.

    Args:
      attr_list_name: a string - the AttrList::name field.
    Returns:
      The message id - a number.
    """
    return self.message_id_by_attr_list_name_[attr_list_name]


def ElementTypeFor(descriptor, field_desc):
  """Returns the element Javascript type for a given field descriptor.

  Args:
    descriptor: The descriptor module from the protobuf package, e.g.
        google.protobuf.descriptor.
    field_desc: A field descriptor for a particular field in a message.
  Returns:
    A string; either the type of a field descriptor or iff the
    field descriptor is a repeated field, it's the element type.
  """
  # If the field is a reference to a tagspec name (string) or if it's
  # holding a message that we're deduplicating and replacing with a
  # synthetic reference field, make it a number instead as we'll be
  # replacing this with the message id.
  if (field_desc.full_name in TAG_SPEC_NAME_REFERENCE_FIELD) or (
      field_desc.full_name in SYNTHETIC_REFERENCE_FIELD) or (
          field_desc.full_name in ATTR_LIST_NAME_REFERENCE_FIELD):
    return 'number'
  return {
      descriptor.FieldDescriptor.TYPE_DOUBLE:
          lambda: 'number',
      descriptor.FieldDescriptor.TYPE_INT32:
          lambda: 'number',
      descriptor.FieldDescriptor.TYPE_BOOL:
          lambda: 'boolean',
      descriptor.FieldDescriptor.TYPE_STRING:
          lambda: 'string',
      descriptor.FieldDescriptor.TYPE_ENUM: (
          lambda: field_desc.enum_type.full_name),
      descriptor.FieldDescriptor.TYPE_MESSAGE: (
          lambda: field_desc.message_type.full_name)
  }[field_desc.type]()


def FieldTypeFor(descriptor, field_desc, nullable):
  """Returns the Javascript type for a given field descriptor.

  Args:
    descriptor: The descriptor module from the protobuf package, e.g.
        google.protobuf.descriptor.
    field_desc: A field descriptor for a particular field in a message.
    nullable: Whether or not the value may be null.
  Returns:
    The Javascript type for the given field descriptor.
  """
  element_type = ElementTypeFor(descriptor, field_desc)
  if field_desc.label == descriptor.FieldDescriptor.LABEL_REPEATED:
    if nullable:
      return 'Array<!%s>' % element_type
    return '!Array<!%s>' % element_type
  if nullable:
    return '?%s' % element_type
  return '%s' % element_type


def ValueToString(descriptor, field_desc, value):
  """For a non-repeated field, renders the value as a Javascript literal.

  Args:
    descriptor: The descriptor module from the protobuf package, e.g.
        google.protobuf.descriptor.
    field_desc: The type descriptor for the field value to be rendered.
    value: The value of the non-repeated field to be rendered.
  Returns:
    A Javascript literal for the provided non-repeated value.
  """
  if field_desc.type == descriptor.FieldDescriptor.TYPE_STRING:
    escaped = ('' + value).encode('unicode-escape')
    return "'%s'" % escaped.decode().replace("'", "\\'")
  if field_desc.type == descriptor.FieldDescriptor.TYPE_BOOL:
    if value:
      return 'true'
    return 'false'
  if field_desc.type == descriptor.FieldDescriptor.TYPE_ENUM:
    enum_value_name = field_desc.enum_type.values_by_number[value].name
    return '%s.%s' % (field_desc.enum_type.full_name, enum_value_name)
  if value is None:
    return 'null'
  return str(value)

CONSTRUCTOR_ARG_FIELDS = [
    'amp.validator.AmpLayout.supported_layouts',
    'amp.validator.AtRuleSpec.name',
    'amp.validator.AtRuleSpec.type',
    'amp.validator.AttrSpec.name',
    'amp.validator.AttrTriggerSpec.also_requires_attr',
    'amp.validator.DenyListedCDataRegex.error_message',
    'amp.validator.DenyListedCDataRegex.regex',
    'amp.validator.ErrorFormat.code',
    'amp.validator.ErrorFormat.format',
    'amp.validator.PropertySpec.name',
    'amp.validator.PropertySpecList.properties',
    'amp.validator.TagSpec.tag_name',
    'amp.validator.UrlSpec.allowed_protocol',
    'amp.validator.ValidatorRules.tags',
]

# In the .protoascii, some fields reference other tags by tag spec name.
# See TagSpecName for how it's computed. This is a string, and this
# code generator replaces these fields with tag ids, which are numbers.
TAG_SPEC_NAME_REFERENCE_FIELD = [
    'amp.validator.ExtensionSpec.deprecated_recommends_usage_of_tag',
    'amp.validator.ReferencePoint.tag_spec_name',
    'amp.validator.TagSpec.also_requires_tag_warning',
    'amp.validator.TagSpec.extension_unused_unless_tag_present',
]

# In the .protoascii, some fields reference other tags by attr list name.
# This is a string, and this code generator replaces these fields with attr
# list ids, which are numbers.
ATTR_LIST_NAME_REFERENCE_FIELD = ['amp.validator.TagSpec.attr_lists']

# These fields contain messages in the .protoascii, but we replace
# them with message ids, which are numbers.
SYNTHETIC_REFERENCE_FIELD = [
    'amp.validator.AttrList.attrs',
    'amp.validator.AttrSpec.disallowed_value_regex',
    'amp.validator.AttrSpec.mandatory_anyof',
    'amp.validator.AttrSpec.mandatory_oneof',
    'amp.validator.AttrSpec.value_regex',
    'amp.validator.AttrSpec.value_regex_casei',
    'amp.validator.AttrTriggerSpec.if_value_regex',
    'amp.validator.CdataSpec.cdata_regex',
    'amp.validator.CssDeclaration.value_regex_casei',
    'amp.validator.TagSpec.attrs',
    'amp.validator.TagSpec.mandatory_alternatives',
    'amp.validator.TagSpec.requires_condition',
    'amp.validator.TagSpec.satisfies_condition',
    'amp.validator.TagSpec.excludes_condition',
]


def PrintClassFor(descriptor, msg_desc, out):
  """Prints a Javascript class for the given proto message.

  This method emits a Javascript class (Closure-style) for the given
  proto message to sys.stdout.

  Args:
    descriptor: The descriptor module from the protobuf package, e.g.
        google.protobuf.descriptor.
    msg_desc: The descriptor for a particular message type.
    out: a list of lines to output (without the newline characters) wrapped as
        an OutputFormatter instance, to which this function will append.
  """
  constructor_arg_fields = []
  constructor_arg_field_names = {}
  for field in msg_desc.fields:
    if field.full_name in CONSTRUCTOR_ARG_FIELDS:
      constructor_arg_fields.append(field)
      constructor_arg_field_names[field.name] = 1
  out.Line('/**')
  for field in constructor_arg_fields:
    out.Line(' * @param {%s} %s' %
             (LocalModuleName(FieldTypeFor(descriptor, field, nullable=False)),
              UnderscoreToCamelCase(field.name)))
  out.Line(' * @constructor')
  out.Line(' * @struct')
  out.Line(' */')
  arguments = ','.join(
      [UnderscoreToCamelCase(f.name) for f in constructor_arg_fields])
  out.Line('const %s = function(%s) {' %
           (LocalModuleName(msg_desc.full_name), arguments))
  out.PushIndent(2)

  for field in msg_desc.fields:
    # We generate ValidatorRules.directAttrLists, ValidatorRules.globalAttrs,
    # and validator.ampLayoutAttrs instead.
    if field.full_name == 'amp.validator.ValidatorRules.attr_lists':
      continue
    assigned_value = 'null'
    if field.name in constructor_arg_field_names:
      # field.name is also the parameter name.
      assigned_value = UnderscoreToCamelCase(field.name)
    elif field.label == descriptor.FieldDescriptor.LABEL_REPEATED:
      # ValidationResult instances may be mutated by validator.js,
      # so we can't share the empty arrays. But for all other
      # instances, we do share.
      if msg_desc.full_name == 'amp.validator.ValidationResult':
        assigned_value = '[]'
      else:
        assigned_value = 'EMPTY_%s_ARRAY' % (
            ElementTypeFor(descriptor, field).replace('.', '_'))
    elif field.type == descriptor.FieldDescriptor.TYPE_BOOL:
      assigned_value = str(field.default_value).lower()
    elif field.type == descriptor.FieldDescriptor.TYPE_INT32:
      assigned_value = str(field.default_value)
    # TODO(johannes): Increase coverage for default values, e.g. enums.
    type_name = FieldTypeFor(
        descriptor, field, nullable=assigned_value == 'null')
    out.Line('/**@export @type {%s} */' % LocalModuleName(type_name))
    out.Line(
        'this.%s = %s;' % (UnderscoreToCamelCase(field.name), assigned_value))
  if msg_desc.full_name == 'amp.validator.CdataSpec':
    out.Line('/** @type {?number} */')
    out.Line('this.combinedDenyListedCdataRegex = null;')
  if msg_desc.full_name == 'amp.validator.ValidatorRules':
    out.Line('/** @type {!Array<!string>} */')
    out.Line('this.internedStrings = [];')
    out.Line('/** @type {!Array<!AttrSpec>} */')
    out.Line('this.attrs = [];')
    out.Line('/** @type {!Array<!Array<number>>} */')
    out.Line('this.directAttrLists = [];')
    out.Line('/** @type {!Array<number>} */')
    out.Line('this.globalAttrs = [];')
    out.Line('/** @type {!Array<number>} */')
    out.Line('this.ampLayoutAttrs = [];')
  out.PopIndent()
  out.Line('};')

  out.Line('exports.%s = %s;' % (LocalModuleName(
      msg_desc.full_name), LocalModuleName(msg_desc.full_name)))


def PrintEnumFor(enum_desc, out):
  """Prints a Javascript enum for the given enum descriptor.

  Args:
    enum_desc: The descriptor for a particular enum type.
    out: a list of lines to output (without the newline characters) wrapped as
        an OutputFormatter instance, to which this function will append.
  """
  out.Line('/**')
  out.Line(' * @enum {string}')
  out.Line(' */')
  out.Line('%s = {' % LocalModuleName(enum_desc.full_name))
  out.PushIndent(2)
  names = []
  for v in enum_desc.values:
    names.append('%s' % v.name)
    out.Line("%s: '%s'," % (v.name, v.name))
  out.PopIndent()
  out.Line('};')

  out.Line('exports.%s = %s;' % (LocalModuleName(
      enum_desc.full_name), LocalModuleName(enum_desc.full_name)))
  out.Line('/** @type {!Array<string>} */')
  out.Line('%s_NamesByIndex = ["%s"];' %
           (LocalModuleName(enum_desc.full_name), '","'.join(names)))
  out.Line('/** @type {!Array<!%s>} */' % LocalModuleName(enum_desc.full_name))
  out.Line(
      '%s_ValuesByIndex = [%s];' %
      (LocalModuleName(enum_desc.full_name), ','.join([
          '%s.%s' % (LocalModuleName(enum_desc.full_name), n) for n in names
      ])))
  out.Line('/** @type (!Object<%s, number>) */' %
           LocalModuleName(enum_desc.full_name))
  out.Line('%s_NumberByName = {' % LocalModuleName(enum_desc.full_name))
  out.PushIndent(2)
  for v in enum_desc.values:
    out.Line("'%s': %s," % (v.name, v.number))
  out.PopIndent()
  out.Line('};')
  out.Line('/** @type (!Object<number, %s>) */' %
           LocalModuleName(enum_desc.full_name))
  out.Line('%s_NameByNumber = {' % LocalModuleName(enum_desc.full_name))
  out.PushIndent(2)
  for v in enum_desc.values:
    out.Line("%s: '%s'," % (v.number, v.name))
  out.PopIndent()
  out.Line('};')


def TagSpecName(tag_spec):
  """Generates a name for a given TagSpec. This should be unique.

  Same logic as getTagSpecName(tagSpec) in javascript. We choose the spec_name
  if one is set, otherwise use the lower cased version of the tagname

  Args:
    tag_spec: A TagSpec protocol message instance.

  Returns:
    This TagSpec's name (string).
  """
  if tag_spec.HasField('spec_name'):
    return tag_spec.spec_name
  return tag_spec.tag_name.lower()


def MaybePrintMessageValue(descriptor, field_val, registry, out):
  """Print field_val if necessary, and return its message reference.

  Args:
    descriptor: The descriptor module from the protobuf package, e.g.
        google.protobuf.descriptor.
    field_val: The value of a field, a proto message.
    registry: an instance of MessageRegistry, used for mapping from
        messages to message keys.
    out: a list of lines to output (without the newline characters) wrapped as
        an OutputFormatter instance, to which this function will append.
  Returns:
    This object's message reference, e.g. typically the variable name in
    validator-generated.js.
  """
  message_key = MessageKey(field_val)
  if not registry.IsPrinted(message_key):
    PrintObject(descriptor, field_val, registry, out)
  return registry.MessageReferenceForKey(message_key)


def IsTrivialAttrSpec(attr):
  """Determines whether a given attr only has its name field set.

  Args:
    attr: an AttrSpec instance.
  Returns:
    true iff the only field that is set is the name field.
  """
  return (attr.DESCRIPTOR.full_name == 'amp.validator.AttrSpec' and
          attr.HasField('name') and len(attr.ListFields()) == 1)


def AssignedValueFor(descriptor, field_desc, field_val, registry, out):
  """Helper function for PrintObject: computes / assigns a value for a field.

  Note that if the field is a complex field (a message), this function
  may print the message and then reference it via a variable name.

  Args:
    descriptor: The descriptor module from the protobuf package, e.g.
        google.protobuf.descriptor.
    field_desc: The descriptor for a particular field.
    field_val: The value for a particular field.
    registry: an instance of MessageRegistry, used for mapping from
        messages to message keys.
    out: a list of lines to output (without the newline characters) wrapped as
        an OutputFormatter instance, to which this function will append.
  Returns:
    The rendered field value to assign.
  """
  # First we establish how an individual value for this field is going
  # to be rendered, that is, converted into a string.
  render_value = lambda: None
  if field_desc.full_name in TAG_SPEC_NAME_REFERENCE_FIELD:
    render_value = lambda v: str(registry.MessageIdForTagSpecName(v))
  elif field_desc.full_name in ATTR_LIST_NAME_REFERENCE_FIELD:
    render_value = lambda v: str(registry.MessageIdForAttrListName(v))
  elif field_desc.full_name in SYNTHETIC_REFERENCE_FIELD:

    def InternOrReference(value):
      if field_desc.type == descriptor.FieldDescriptor.TYPE_STRING:
        return str(registry.InternString(value))
      if IsTrivialAttrSpec(value):
        return str(registry.InternString(value.name))
      return str(registry.MessageIdForKey(MessageKey(value)))

    render_value = InternOrReference
  elif field_desc.type == descriptor.FieldDescriptor.TYPE_MESSAGE:
    render_value = (
        lambda v: MaybePrintMessageValue(descriptor, v, registry, out))
  else:
    render_value = (
        lambda v: ImportModuleName(ValueToString(descriptor, field_desc, v)))  # pylint: disable=cell-var-from-loop

  # Then we iterate over the field if it's repeated, or else just
  # call the render function once.
  if field_desc.label == descriptor.FieldDescriptor.LABEL_REPEATED:
    elements = [render_value(v) for v in field_val]
    return '[%s]' % ','.join(elements)
  return render_value(field_val)


def PrintObject(descriptor, msg, registry, out):
  """Prints an object, by recursively constructing it.

  This routine emits Javascript which will construct an object modeling
  the provided message (in practice the ValidatorRules message).
  It references the classes and enums enitted by PrintClassFor and PrintEnumFor.

  Args:
    descriptor: The descriptor module from the protobuf package, e.g.
        google.protobuf.descriptor.
    msg: A protocol message instance.
    registry: an instance of MessageRegistry, used for mapping from
        messages to message keys.
    out: a list of lines to output (without the newline characters) wrapped as
        an OutputFormatter instance, to which this function will append.
  Returns:
    This object's object id, that is, the consumed variable for creating
    objects.
  """
  this_message_key = MessageKey(msg)
  registry.MarkPrinted(this_message_key)

  field_and_assigned_values = []
  for (field_desc, field_val) in msg.ListFields():
    # We generate ValidatorRules.directAttrLists, ValidatorRules.globalAttrs,
    # and validator.ampLayoutAttrs instead.
    if field_desc.full_name == 'amp.validator.ValidatorRules.attr_lists':
      continue
    field_and_assigned_values.append(
        (field_desc,
         AssignedValueFor(descriptor, field_desc, field_val, registry, out)))

  # Constructor with the appropriate arguments.
  constructor_arg_values = [
      value for (field, value) in field_and_assigned_values
      if field.full_name in CONSTRUCTOR_ARG_FIELDS
  ]

  this_message_reference = registry.MessageReferenceForKey(this_message_key)

  # Construct object field values.
  fields = []
  fields_string = ''
  for (field, value) in field_and_assigned_values:
    if field.full_name in CONSTRUCTOR_ARG_FIELDS:
      continue
    fields.append('%s : %s' %  (UnderscoreToCamelCase(field.name), value))

  # Construct the object with object literal field assignment. Rather than
  # assignment via dot notation, this is more concise and helps reduce the size
  # of the binary. We also use Object.assign as to not blow away fields that are
  # set constructor instantiation.
  if fields:
    fields_string = '{' + ','.join(fields) + '}'
    out.Line(
        'let %s = /** @type {!%s} */ (oa(new %s(%s), %s));' %
        (this_message_reference, ImportModuleName(msg.DESCRIPTOR.full_name),
         ImportModuleName(msg.DESCRIPTOR.full_name),
         ','.join(constructor_arg_values), fields_string))
  else:
    out.Line('let %s = new %s(%s);' %
             (this_message_reference, ImportModuleName(
                 msg.DESCRIPTOR.full_name), ','.join(constructor_arg_values)))

  if (msg.DESCRIPTOR.full_name == 'amp.validator.CdataSpec' and
      msg.disallowed_cdata_regex):
    combined_disallowed_cdata_regex = '(%s)' % '|'.join(
        [r.regex for r in msg.disallowed_cdata_regex])
    out.Line('%s.%s = %d;' %
             (this_message_reference, 'combinedDenyListedCdataRegex',
              registry.InternString(combined_disallowed_cdata_regex)))


# When importing the protocol buffer javascript module, we do so as
# protoGenerated.foo();
def ImportModuleName(module_name):
  return module_name.replace('amp.validator', 'protoGenerated')


# When naming the protocol buffer javascript exports locally, we do with no
# namespace.
def LocalModuleName(module_name):
  return module_name.replace('amp.validator.', '')


def GenerateValidatorGeneratedJs(specfile, validator_pb2, generate_proto_only,
                                 generate_spec_only, text_format, html_format,
                                 descriptor, out):
  """Main method for the code generator.

  This method reads the specfile and emits Javascript to sys.stdout.

  Args:
    specfile: Path to validator.protoascii, the specfile to generate
        Javascript from.
    validator_pb2: The proto2 Python module generated from validator.proto.
    generate_proto_only: If true, then only generate proto definition.
    generate_spec_only: If true, then only generate spec.
    text_format: The text_format module from the protobuf package, e.g.
        google.protobuf.text_format.
    html_format: Either a TagSpec.HtmlFormat enum value indicating which
        HTML format the generated validator code should support,
        or None indicating that all formats should be supported.
    descriptor: The descriptor module from the protobuf package, e.g.
        google.protobuf.descriptor.
    out: a list of lines to output (without the newline characters), to
        which this function will append.
  """

  # Only one of these flags should be true.
  assert generate_proto_only is not generate_spec_only

  if generate_spec_only:
    assert specfile is not None

  # First, find the descriptors and enums and generate Javascript
  # classes and enums.
  msg_desc_by_name = {}
  enum_desc_by_name = {}
  FindDescriptors(validator_pb2, msg_desc_by_name, enum_desc_by_name)

  rules_obj = '%s.RULES' % validator_pb2.DESCRIPTOR.package
  all_names = [rules_obj] + list(msg_desc_by_name.keys()) + list(enum_desc_by_name.keys())
  all_names.sort()

  out = OutputFormatter(out)
  out.Line('//')
  out.Line('// Generated by %s - do not edit.' % os.path.basename(__file__))
  out.Line('//')
  out.Line('')
  if generate_proto_only:
    out.Line("goog.module('amp.validator.protogenerated');")
  if generate_spec_only:
    out.Line("goog.module('amp.validator.createRules');")
    out.Line(
        "const protoGenerated = goog.require('amp.validator.protogenerated');")
  out.Line('')

  if generate_proto_only:
    # We share the empty arrays between all specification object instances; this
    # works because these arrays are never mutated. To make the Closure compiler
    # happy, we use one empty array per element type.
    # PS: It may also help execution performance in V8 to keep the element types
    #     separate but we did not verify that.
    all_type_names = ['string', 'number', 'boolean'] + [
        n for n in all_names if n in msg_desc_by_name
    ] + [n for n in all_names if n in enum_desc_by_name]

    for name in all_type_names:
      out.Line('/** @type {!Array<!%s>} */' % LocalModuleName(name))
      out.Line('var EMPTY_%s_ARRAY = [];' % name.replace('.', '_'))
      out.Line('')

    for name in all_names:
      if name in msg_desc_by_name:
        PrintClassFor(descriptor, msg_desc_by_name[name], out)
      elif name in enum_desc_by_name:
        PrintEnumFor(enum_desc_by_name[name], out)

  if generate_spec_only:
    # Read the rules file, validator.protoascii by parsing it as a text
    # message of type ValidatorRules.
    rules = validator_pb2.ValidatorRules()
    text_format.Merge(open(specfile).read(), rules)

    # If html_format is set, only keep the tags which are relevant to it.
    if html_format is not None:
      filtered_rules = [
          t for t in rules.tags
          if not t.html_format or html_format in t.html_format
      ]
      del rules.tags[:]
      rules.tags.extend(filtered_rules)

    # Add module/nomodule tagspecs for AMP ExtensionSpec tagspecs.
    additional_tagspecs = []
    for t in rules.tags:
      if t.extension_spec and t.extension_spec.name:
        # This is satisfied by any of the `v0.js` variants:
        t.requires_condition.extend(['amphtml javascript runtime (v0.js)'])
        if validator_pb2.HtmlFormat.Code.Value('AMP') in t.html_format:
          tagspec = copy.deepcopy(t)
          # Reset html_format to AMP
          del tagspec.html_format[:]
          tagspec.html_format.extend(
              [validator_pb2.HtmlFormat.Code.Value('AMP')])
          # Reset enabled_by to transformed
          del tagspec.enabled_by[:]
          tagspec.enabled_by.extend(['transformed'])

          # Generate needed attr specs
          crossorigin_attrspec = validator_pb2.AttrSpec()
          crossorigin_attrspec.name = 'crossorigin'
          crossorigin_attrspec.value.extend(['anonymous'])
          crossorigin_attrspec.mandatory = True
          nomodule_attrspec = validator_pb2.AttrSpec()
          nomodule_attrspec.name = 'nomodule'
          nomodule_attrspec.value.extend([''])
          nomodule_attrspec.mandatory = True
          type_attrspec = validator_pb2.AttrSpec()
          type_attrspec.name = 'type'
          type_attrspec.value.extend(['module'])
          type_attrspec.mandatory = True
          type_attrspec.dispatch_key = type_attrspec.NAME_VALUE_DISPATCH

          # Create module and nomodule extension tagspecs with spec_names
          module_tagspec = copy.deepcopy(tagspec)
          base_spec_name = module_tagspec.extension_spec.name
          if module_tagspec.extension_spec.version_name:
            base_spec_name = (
                module_tagspec.extension_spec.name + ' ' +
                module_tagspec.extension_spec.version_name)
          module_tagspec.spec_name = base_spec_name + (' module extension '
                                                       'script')
          nomodule_tagspec = copy.deepcopy(tagspec)
          nomodule_tagspec.spec_name = base_spec_name + (' nomodule extension'
                                                         ' script')

          # Module extension specifics
          # Add requires/satisfies pair for module/nomodule
          module_tagspec.requires_condition.extend([nomodule_tagspec.spec_name])
          module_tagspec.satisfies_condition.extend([module_tagspec.spec_name])
          # Add attr specs
          module_tagspec.attrs.extend([crossorigin_attrspec, type_attrspec])

          # Nomodule extension specifics
          # Add requires/satisfies pair for module/nomodule
          nomodule_tagspec.requires_condition.extend([module_tagspec.spec_name])
          nomodule_tagspec.satisfies_condition.extend(
              [nomodule_tagspec.spec_name])
          # Add attr specs
          nomodule_tagspec.attrs.extend([nomodule_attrspec])

          # Add tag specs
          additional_tagspecs.extend([module_tagspec, nomodule_tagspec])
    rules.tags.extend(additional_tagspecs)

    registry = MessageRegistry()

    # Register the tagspecs so they have ids 0 - rules.tags.length. This means
    # that rules.tags[tagspec_id] works.
    for t in rules.tags:
      registry.RegisterTagSpec(t)

    # Register the attrlists so they have ids 0 - rules.attr_lists.length.
    # This means that rules.attr_lists[attr_list_id] works.
    for a in rules.attr_lists:
      registry.RegisterAttrList(a)

    out.Line('/**')
    out.Line(' * @return {!%s}' % ImportModuleName(rules.DESCRIPTOR.full_name))
    out.Line(' */')
    out.Line('const createRules = function() {')
    # Shorthand object.assign to reduce the binary size of the validator rules
    # generated.
    out.Line('const oa = Object.assign;')
    out.PushIndent(2)
    PrintObject(descriptor, rules, registry, out)

    # We use this below to reference the variable holding the rules instance.
    rules_reference = registry.MessageReferenceForKey(MessageKey(rules))

    # Create a mapping from attr spec ids to AttrSpec instances, deduping the
    # AttrSpecs. Then sort by these ids, so now we get a dense array starting
    # with the attr that has attr spec id 0 - number of attr specs.
    attrs_by_id = {}
    for attr_container in list(rules.attr_lists) + list(rules.tags):
      for attr in attr_container.attrs:
        if not IsTrivialAttrSpec(attr):
          attrs_by_id[registry.MessageIdForKey(MessageKey(attr))] = attr
    sorted_attrs = [attr for (_, attr) in sorted(attrs_by_id.items())]

    # Emit the attr specs, then assign a list of references to them to
    # Rules.attrs.
    for attr in sorted_attrs:
      PrintObject(descriptor, attr, registry, out)
    out.Line('%s.attrs = [%s];' % (rules_reference, ','.join([
        registry.MessageReferenceForKey(MessageKey(a)) for a in sorted_attrs
    ])))

    # We emit the attr lists as arrays of arrays of numbers (which are
    # the attr ids), and treat the globalAttrs and the ampLayoutAttrs
    # separately for fast access.
    direct_attr_lists = []
    global_attrs = []
    amp_layout_attrs = []
    unique_attr_list_names = set()
    for attr_list in rules.attr_lists:
      assert attr_list.name not in unique_attr_list_names, attr_list.name
      unique_attr_list_names.add(attr_list.name)
      assert attr_list.attrs

      attr_id_list = []
      for attr in attr_list.attrs:
        if IsTrivialAttrSpec(attr):
          attr_id_list.append(registry.InternString(attr.name))
        else:
          attr_id_list.append(registry.MessageIdForKey(MessageKey(attr)))
      if attr_list.name == '$GLOBAL_ATTRS':
        global_attrs = attr_id_list
        direct_attr_lists.append([])
      elif attr_list.name == '$AMP_LAYOUT_ATTRS':
        amp_layout_attrs = attr_id_list
        direct_attr_lists.append([])
      else:
        direct_attr_lists.append(attr_id_list)

    out.Line('%s.directAttrLists = %s;' % (rules_reference,
                                           json.dumps(direct_attr_lists)))
    out.Line('%s.globalAttrs = %s;' % (rules_reference,
                                       json.dumps(global_attrs)))
    out.Line('%s.ampLayoutAttrs = %s;' % (rules_reference,
                                          json.dumps(amp_layout_attrs)))

    # We emit these after the last call to registry.InternString.
    out.Line('%s.internedStrings = %s;' %
             (rules_reference, json.dumps(registry.InternedStrings())))

    out.Line('return %s;' % rules_reference)
    out.PopIndent()
    out.Line('}')
    out.Line('exports.createRules = createRules;')
    out.Line('')


def GenerateValidatorGeneratedJson(specfile, validator_pb2, text_format,
                                   json_format, out):
  """Generates a JSON file with definitions from validator.protoascii.

  This method reads the specfile and emits JSON to out.

  Args:
    specfile: Path to validator.protoascii, the specfile to generate
        Javascript from.
    validator_pb2: The proto2 Python module generated from validator.proto.
    text_format: The text_format module from the protobuf package, e.g.
        google.protobuf.text_format.
    json_format: The json_format module from the protobuf package, e.g.
        google.protobuf.json_format.
    out: a list of lines to output (without the newline characters), to
        which this function will append.
  """

  rules = validator_pb2.ValidatorRules()
  text_format.Merge(open(specfile).read(), rules)
  out.append(json_format.MessageToJson(rules))
