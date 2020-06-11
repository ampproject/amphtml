#!/bin/bash

grep -rl 'third_party/ampvalidator' ./ | xargs sed -i 's/quality\/dni\/validator/third_party\/ampvalidator/g'

grep -rl 'namespace amp::validator' ./ | xargs sed -i 's/namespace amp::validator/namespace amp::validator/g'

grep -rl 'THIRD_PARTY_AMPVALIDATOR' ./ | xargs sed -i 's/THIRD_PARTY_AMPVALIDATOR/THIRD_PARTY_AMPVALIDATOR/g'
