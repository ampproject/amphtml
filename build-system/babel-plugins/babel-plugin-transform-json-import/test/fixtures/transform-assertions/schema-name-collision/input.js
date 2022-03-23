// validate is ajvCompile's output name, it should be renamed
import validate from './name-collision.schema.json' assert {type: 'json-schema'};
validate(123);
