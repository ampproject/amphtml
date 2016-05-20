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

"""Generates validator-generated.php.

Please note that this file (validator_gen_php.py) is derived from
validator_gen.py (and very similar to it). Please do a diff between
them to see the similarities/differences.

validator_gen.py generates javascript code while, this file,
validator_gen_php.py generates PHP code.

This script reads validator.protoascii and reflects over its contents
to generate PHP. This PHP consists of PHP classes and enums, as well
as a createRules function which instantiates the data structures
specified in validator.protoascii - the validator rules.

From a PHP perspective, this approach looks elaborate - you may
wonder why we're not just writing PHP directly, or why we're
not encoding our rules in JSON or YAML or even, gasp, XML? Besides the
additional type safety that we gain from our approach, it allows us to
share the rule specifications, error codes, etc. between multiple
validator implemenations, including an implementation in C++. This
makes it much easier to keep otherwise likely divergent behavior in
sync.
"""

import os
import pdb

def ProperPHPClassName(name):
  # omit the first two names, usually amp.validator
  return ''.join(name.split('.')[2:])

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


def FieldTypeFor(descriptor, field_desc):
  """Returns the PHP type for a given field descriptor.

  Args:
    descriptor: The descriptor module from the protobuf package, e.g.
        google.protobuf.descriptor.
    field_desc: A field descriptor for a particular field in a message.
  Returns:
    The PHP type for the given field descriptor.
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
    return '!Array<!%s>' % element_type
  else:
    return element_type


def NonRepeatedValueToString(descriptor, field_desc, value):
  """For a non-repeated field, renders the value as a PHP literal.

  Helper function for ValueToString.

  Args:
    descriptor: The descriptor module from the protobuf package, e.g.
        google.protobuf.descriptor.
    field_desc: The type descriptor for the field value to be rendered.
    value: The value of the non-repeated field to be rendered.
  Returns:
    A PHP literal for the provided non-repeated value.
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
    return '%s::%s' % (ProperPHPClassName(field_desc.enum_type.full_name), enum_value_name)
  if value is None:
    return 'null'
  return str(value)


def ValueToString(descriptor, field_desc, value):
  """Renders a field value as a PHP literal.

  Args:
    descriptor: The descriptor module from the protobuf package, e.g.
        google.protobuf.descriptor.
    field_desc: The type descriptor for the field value to be rendered.
    value: The value of the field to be rendered.
  Returns:
    A PHP literal for the provided value.
  """
  if field_desc.label == descriptor.FieldDescriptor.LABEL_REPEATED:
    if value:
      return '[%s]' % ', '.join([NonRepeatedValueToString(descriptor,
                                                          field_desc, s)
                                 for s in value])
    return '[]'
  return NonRepeatedValueToString(descriptor, field_desc, value)


def PrintClassFor(descriptor, msg_desc, out):
  """Prints a PHP class for the given proto message.

  This method emits a PHP for the given
  proto message to sys.stdout.

  Args:
    descriptor: The descriptor module from the protobuf package, e.g.
        google.protobuf.descriptor.
    msg_desc: The descriptor for a particular message type.
    out: a list of lines to output (without the newline characters), to
        which this function will append.
  """
  out.append('class %s {' % ProperPHPClassName(msg_desc.full_name))
  for field in msg_desc.fields:
    if field.label == descriptor.FieldDescriptor.LABEL_REPEATED:
      out.append('  public $%s = [];' % field.name)
    else:
      out.append('  public $%s = null;' % field.name)
  out.append('}')
  out.append('')


def PrintEnumFor(enum_desc, out):
  """Prints a PHP enum for the given enum descriptor.

  Args:
    enum_desc: The descriptor for a particular enum type.
    out: a list of lines to output (without the newline characters), to
        which this function will append.
  """
  out.append('class %s {' % ProperPHPClassName(enum_desc.full_name))
  str = ''
  for v in enum_desc.values:
    str += " const %s = '%s';\n" % (v.name, v.name)
  out.append(str)
  out.append('}')


def PrintObject(descriptor, msg, this_id, out):
  """Prints an object, by recursively constructing it.

  This routine emits PHP which will construct an object modeling
  the provided message (in practice the ValidatorRules message).
  It references the classes and enums enitted by PrintClassFor and PrintEnumFor.

  Args:
    descriptor: The descriptor module from the protobuf package, e.g.
        google.protobuf.descriptor.
    msg: A protocol message instance.
    this_id: The id for the object being printed (all variables have the form
        o_${num} with ${num} being increasing integers
    out: a list of lines to output (without the newline characters), to
        which this function will append.
  Returns:
    The next object id, that is, next variable available for creating objects.
  """
  out.append('  $o_%d = new %s();' % (this_id, ProperPHPClassName(msg.DESCRIPTOR.full_name)))
  next_id = this_id + 1
  for (field_desc, field_val) in msg.ListFields():
    if field_desc.type == descriptor.FieldDescriptor.TYPE_MESSAGE:
      if field_desc.label == descriptor.FieldDescriptor.LABEL_REPEATED:
        for val in field_val:
          field_id = next_id
          next_id = PrintObject(descriptor, val, field_id, out)
          out.append('  $o_%d->%s[] = $o_%d;' % (this_id, field_desc.name, field_id))
      else:
        field_id = next_id
        next_id = PrintObject(descriptor, field_val, field_id, out)
        out.append('  $o_%d->%s = $o_%d;' % (this_id, field_desc.name, field_id))
    else:
      out.append('  $o_%d->%s = %s;' % (
          this_id, field_desc.name,
          ValueToString(descriptor, field_desc, field_val)))
  return next_id


def GenerateValidatorGeneratedPHP(specfile, validator_pb2, text_format,
                                 descriptor, out):
  """Main method for the code generator.

  This method reads the specfile and emits PHP to sys.stdout.

  Args:
    specfile: Path to validator.protoascii, the specfile to generate
        PHP from.
    validator_pb2: The proto2 Python module generated from validator.proto.
    text_format: The text_format module from the protobuf package, e.g.
        google.protobuf.text_format.
    descriptor: The descriptor module from the protobuf package, e.g.
        google.protobuf.descriptor.
    out: a list of lines to output (without the newline characters), to
        which this function will append.
  """
  # First, find the descriptors and enums and generate PHP
  # classes and enums.
  msg_desc_by_name = {}
  enum_desc_by_name = {}
  FindDescriptors(validator_pb2, msg_desc_by_name, enum_desc_by_name)

  rules_obj = '%s.RULES' % validator_pb2.DESCRIPTOR.package
  all_names = [rules_obj] + msg_desc_by_name.keys() + enum_desc_by_name.keys()
  all_names.sort()

  output_header = """<?php
/*
 * Copyright 2016 Google
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

//
// Generated by validator_gen_php.py - do not edit.
//   validator_gen_php.py is available in a Lullabot forked repo https://github.com/Lullabot/amphtml
//   Be sure to look in the `php-validator-generated` branch of the repo in the `validator` folder
//

namespace Lullabot\AMP\Spec;
"""

  out.append(output_header);

  for name in all_names:
    if name in msg_desc_by_name:
      PrintClassFor(descriptor, msg_desc_by_name[name], out)
    elif name in enum_desc_by_name:
      PrintEnumFor(enum_desc_by_name[name], out)

  # Read the rules file, validator.protoascii by parsing it as a text
  # message of type ValidatorRules.
  rules = validator_pb2.ValidatorRules()
  text_format.Merge(open(specfile).read(), rules)
  out.append('class ValidationRulesFactory {')
  out.append('  public static function createValidationRules() {')
  PrintObject(descriptor, rules, 0, out)
  out.append('  return $o_0;')
  out.append('  }')
  out.append('}')
  out.append('')
