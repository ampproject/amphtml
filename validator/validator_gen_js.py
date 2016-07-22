#
# Copyright 2015 The AMP HTML Authors. All Rights Reserved.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#      http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS-IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the license.
#
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
validator implemenations, including an implementation in C++. This
makes it much easier to keep otherwise likely divergent behavior in
sync.
"""

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
  for msg_type in validator_pb2.DESCRIPTOR.message_types_by_name.values():
    msg_desc_by_name[msg_type.full_name] = msg_type
    for enum_type in msg_type.enum_types:
      enum_desc_by_name[enum_type.full_name] = enum_type


class Indenter(object):
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
  element_type = {
      descriptor.FieldDescriptor.TYPE_DOUBLE: lambda: 'number',
      descriptor.FieldDescriptor.TYPE_INT32: lambda: 'number',
      descriptor.FieldDescriptor.TYPE_BOOL: lambda: 'boolean',
      descriptor.FieldDescriptor.TYPE_STRING: lambda: 'string',
      descriptor.FieldDescriptor.TYPE_ENUM: (
          lambda: field_desc.enum_type.full_name),
      descriptor.FieldDescriptor.TYPE_MESSAGE: (
          lambda: field_desc.message_type.full_name),
  }[field_desc.type]()
  if field_desc.label == descriptor.FieldDescriptor.LABEL_REPEATED:
    if nullable:
      return 'Array<!%s>' % element_type
    return '!Array<!%s>' % element_type
  if nullable:
    return '?%s' % element_type
  return '%s' % element_type


def NonRepeatedValueToString(descriptor, field_desc, value):
  """For a non-repeated field, renders the value as a Javascript literal.

  Helper function for ValueToString.

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
    return "'%s'" % escaped.replace("'", "\\'")
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


def ValueToString(descriptor, field_desc, value):
  """Renders a field value as a Javascript literal.

  Args:
    descriptor: The descriptor module from the protobuf package, e.g.
        google.protobuf.descriptor.
    field_desc: The type descriptor for the field value to be rendered.
    value: The value of the field to be rendered.
  Returns:
    A Javascript literal for the provided value.
  """
  if field_desc.label == descriptor.FieldDescriptor.LABEL_REPEATED:
    if value:
      return '[%s]' % ', '.join([NonRepeatedValueToString(descriptor,
                                                          field_desc, s)
                                 for s in value])
    return '[]'
  return NonRepeatedValueToString(descriptor, field_desc, value)


# For the validator-light version, skip these fields. This works by
# putting them inside a conditional with
# amp.validator.GENERATE_DETAILED_ERRORS. The Closure compiler will then
# leave them out via dead code elimination.
SKIP_FIELDS_FOR_LIGHT = ['error_formats', 'spec_url', 'validator_revision',
                         'spec_file_revision', 'template_spec_url',
                         'min_validator_revision_required', 'deprecation_url',
                         'errors']
SKIP_CLASSES_FOR_LIGHT = ['amp.validator.ValidationError']
EXPORTED_CLASSES = ['amp.validator.ValidationResult',
                    'amp.validator.ValidationError']
CONSTRUCTOR_ARG_FIELDS = [
    'amp.validator.AmpLayout.supported_layouts',
    'amp.validator.AtRuleSpec.name',
    'amp.validator.AtRuleSpec.type',
    'amp.validator.AttrList.attrs',
    'amp.validator.AttrList.name',
    'amp.validator.AttrSpec.name',
    'amp.validator.AttrTriggerSpec.also_requires_attr',
    'amp.validator.BlackListedCDataRegex.error_message',
    'amp.validator.BlackListedCDataRegex.regex',
    'amp.validator.ErrorFormat.code',
    'amp.validator.ErrorFormat.format',
    'amp.validator.PropertySpec.name',
    'amp.validator.PropertySpecList.properties',
    'amp.validator.TagSpec.tag_name',
    'amp.validator.UrlSpec.allowed_protocol',
    'amp.validator.ValidatorRules.attr_lists',
    'amp.validator.ValidatorRules.tags',
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
        an Indenter instance, to which this function will append.
  """
  if msg_desc.full_name in SKIP_CLASSES_FOR_LIGHT:
    out.Line('if (amp.validator.GENERATE_DETAILED_ERRORS) {')
    out.PushIndent(2)
  constructor_arg_fields = []
  constructor_arg_field_names = {}
  for field in msg_desc.fields:
    if field.full_name in CONSTRUCTOR_ARG_FIELDS:
      constructor_arg_fields.append(field)
      constructor_arg_field_names[field.name] = 1
  out.Line('/**')
  for field in constructor_arg_fields:
    out.Line(' * @param {%s} %s' % (FieldTypeFor(descriptor, field,
                                                 nullable=False),
                                    UnderscoreToCamelCase(field.name)))
  out.Line(' * @constructor')
  out.Line(' * @struct')
  export_or_empty = ''
  if msg_desc.full_name in EXPORTED_CLASSES:
    out.Line(' * @export')
    export_or_empty = ' @export'
  out.Line(' */')
  out.Line('%s = function(%s) {' % (
      msg_desc.full_name,
      ','.join([UnderscoreToCamelCase(f.name)
                for f in constructor_arg_fields])))
  out.PushIndent(2)
  for field in msg_desc.fields:
    if field.name in SKIP_FIELDS_FOR_LIGHT:
      out.Line('if (amp.validator.GENERATE_DETAILED_ERRORS) {')
      out.PushIndent(2)
    assigned_value = 'null'
    if field.name in constructor_arg_field_names:
      # field.name is also the parameter name.
      assigned_value = UnderscoreToCamelCase(field.name)
    elif field.label == descriptor.FieldDescriptor.LABEL_REPEATED:
      assigned_value = '[]'
    elif field.type == descriptor.FieldDescriptor.TYPE_BOOL:
      assigned_value = str(field.default_value).lower()
    elif field.type == descriptor.FieldDescriptor.TYPE_INT32:
      assigned_value = str(field.default_value)
    # TODO(johannes): Increase coverage for default values, e.g. enums.

    out.Line('/**%s @type {%s} */' % (
        export_or_empty,
        FieldTypeFor(descriptor, field, nullable=assigned_value == 'null')))
    out.Line('this.%s = %s;' % (UnderscoreToCamelCase(field.name),
                                assigned_value))
    if field.name in SKIP_FIELDS_FOR_LIGHT:
      out.PopIndent()
      out.Line('}')
  out.PopIndent()
  out.Line('};')
  if msg_desc.full_name in SKIP_CLASSES_FOR_LIGHT:
    out.PopIndent()
    out.Line('}')
  out.Line('')


SKIP_ENUMS_FOR_LIGHT = ['amp.validator.ValidationError.Code',
                        'amp.validator.ValidationError.Severity']


def PrintEnumFor(enum_desc, out):
  """Prints a Javascript enum for the given enum descriptor.

  Args:
    enum_desc: The descriptor for a particular enum type.
    out: a list of lines to output (without the newline characters) wrapped as
        an Indenter instance, to which this function will append.
  """
  if enum_desc.full_name in SKIP_ENUMS_FOR_LIGHT:
    out.Line('if (amp.validator.GENERATE_DETAILED_ERRORS) {')
    out.PushIndent(2)
  out.Line('/**')
  out.Line(' * @enum {string}')
  out.Line(' * @export')
  out.Line(' */')
  out.Line('%s = {' % enum_desc.full_name)
  out.PushIndent(2)
  for v in enum_desc.values:
    out.Line("%s: '%s'," % (v.name, v.name))
  out.PopIndent()
  out.Line('};')
  if enum_desc.full_name in SKIP_ENUMS_FOR_LIGHT:
    out.PopIndent()
    out.Line('}')
  out.Line('')


def PrintObject(descriptor, msg, this_id, out):
  """Prints an object, by recursively constructing it.

  This routine emits Javascript which will construct an object modeling
  the provided message (in practice the ValidatorRules message).
  It references the classes and enums enitted by PrintClassFor and PrintEnumFor.

  Args:
    descriptor: The descriptor module from the protobuf package, e.g.
        google.protobuf.descriptor.
    msg: A protocol message instance.
    this_id: The id for the object being printed (all variables have the form
        o_${num} with ${num} being increasing integers
    out: a list of lines to output (without the newline characters) wrapped as
        an Indenter instance, to which this function will append.
  Returns:
    The next object id, that is, next variable available for creating objects.
  """
  next_id = this_id + 1
  field_and_assigned_values = []
  for (field_desc, field_val) in msg.ListFields():
    if field_desc.type == descriptor.FieldDescriptor.TYPE_MESSAGE:
      if field_desc.label == descriptor.FieldDescriptor.LABEL_REPEATED:
        elements = []
        for val in field_val:
          field_id = next_id
          next_id = PrintObject(descriptor, val, field_id, out)
          elements.append('o_%d' % field_id)
        field_and_assigned_values.append(
            (field_desc, '[%s]' % ','.join(elements)))
      else:
        field_id = next_id
        next_id = PrintObject(descriptor, field_val, field_id, out)
        field_and_assigned_values.append((field_desc, 'o_%d' % field_id))
    else:
      field_and_assigned_values.append(
          (field_desc, ValueToString(descriptor, field_desc, field_val)))
  constructor_arg_values = []
  for (field, value) in field_and_assigned_values:
    if field.full_name in CONSTRUCTOR_ARG_FIELDS:
      constructor_arg_values.append(value)
  out.Line('var o_%d = new %s(%s);' % (
      this_id, msg.DESCRIPTOR.full_name, ','.join(constructor_arg_values)))
  for (field, value) in field_and_assigned_values:
    if field.full_name not in CONSTRUCTOR_ARG_FIELDS:
      if field.name in SKIP_FIELDS_FOR_LIGHT:
        out.Line('if (amp.validator.GENERATE_DETAILED_ERRORS) {')
        out.PushIndent(2)
      out.Line('o_%d.%s = %s;' % (this_id,
                                  UnderscoreToCamelCase(field.name), value))
      if field.name in SKIP_FIELDS_FOR_LIGHT:
        out.PopIndent()
        out.Line('}')
  return next_id


def GenerateValidatorGeneratedJs(specfile, validator_pb2, text_format,
                                 descriptor, out):
  """Main method for the code generator.

  This method reads the specfile and emits Javascript to sys.stdout.

  Args:
    specfile: Path to validator.protoascii, the specfile to generate
        Javascript from.
    validator_pb2: The proto2 Python module generated from validator.proto.
    text_format: The text_format module from the protobuf package, e.g.
        google.protobuf.text_format.
    descriptor: The descriptor module from the protobuf package, e.g.
        google.protobuf.descriptor.
    out: a list of lines to output (without the newline characters), to
        which this function will append.
  """
  # First, find the descriptors and enums and generate Javascript
  # classes and enums.
  msg_desc_by_name = {}
  enum_desc_by_name = {}
  FindDescriptors(validator_pb2, msg_desc_by_name, enum_desc_by_name)

  rules_obj = '%s.RULES' % validator_pb2.DESCRIPTOR.package
  all_names = [rules_obj] + msg_desc_by_name.keys() + enum_desc_by_name.keys()
  all_names.sort()

  out = Indenter(out)
  out.Line('//')
  out.Line('// Generated by %s - do not edit.' % os.path.basename(__file__))
  out.Line('//')
  out.Line('')
  for name in all_names:
    out.Line("goog.provide('%s');" % name)
  out.Line("goog.provide('amp.validator.GENERATE_DETAILED_ERRORS');")
  out.Line('')
  out.Line('/** @define {boolean} */')
  out.Line('amp.validator.GENERATE_DETAILED_ERRORS = true;')
  out.Line('')

  for name in all_names:
    if name in msg_desc_by_name:
      PrintClassFor(descriptor, msg_desc_by_name[name], out)
    elif name in enum_desc_by_name:
      PrintEnumFor(enum_desc_by_name[name], out)

  # Read the rules file, validator.protoascii by parsing it as a text
  # message of type ValidatorRules.
  rules = validator_pb2.ValidatorRules()
  text_format.Merge(open(specfile).read(), rules)
  out.Line('/**')
  out.Line(' * @return {!%s}' % rules.DESCRIPTOR.full_name)
  out.Line(' */')
  out.Line('function createRules() {')
  out.PushIndent(2)
  PrintObject(descriptor, rules, 0, out)
  out.Line('return o_0;')
  out.PopIndent()
  out.Line('}')
  out.Line('')
  out.Line('/**')
  out.Line(' * @type {!%s}' % rules.DESCRIPTOR.full_name)
  out.Line(' */')
  out.Line('%s = createRules();' % rules_obj)
