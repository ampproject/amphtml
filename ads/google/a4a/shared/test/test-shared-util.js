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
});
