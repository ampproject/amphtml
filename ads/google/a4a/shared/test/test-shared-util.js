import {validateAdContentRating} from "#ads/google/a4a/shared/shared-util";

describes.sandboxed('validateAdContentRating', {}, function () {
  it('should return true if valid content rating provided', function () {
    const runTest = (contentRating) => {
      expect(
        validateAdContentRating(contentRating)
      ).to.equal(true);
    };
    runTest(
      /* contentRating= */ 'e',
    );
    runTest(
      /* contentRating= */ 'pg',
    );
    runTest(
      /* contentRating= */ 't',
    );
    runTest(
      /* contentRating= */ 'ma',
    );
  });

  it('should return false if invalid content rating provided', function () {
    const runTest = (contentRating) => {
      expect(validateAdContentRating(contentRating)).to.equal(false);
    };
    // One of pub control params is missing.
    runTest(
      "abcd"
    );
    runTest(
      123
    );
    runTest(
      "PG"
    );
  });

// it('should reject invalid content ratings', function () {
//   const runTest = (contentRating, expectedErrorRegex) => {
//     const validationError = validateAdContentRating(contentRating);
//     expect(validationError).to.match(expectedErrorRegex);
//   };
//   // One of pub control params is missing.
//   runTest(
//     "abcd",
//     /Max Ad Content Rating value, .*, is not a valid rating/
//   );
//   runTest(
//     123,
//     /Max Ad Content Rating value, .* , is not a valid rating/
//   );
//   runTest(
//     "PG",
//     /Max Ad Content Rating value, .* , is not a valid rating/
//   );
// });
});
