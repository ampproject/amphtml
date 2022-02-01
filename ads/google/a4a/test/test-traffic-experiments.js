import {
  addAmpExperimentIdToElement,
  addExperimentIdToElement,
  isInExperiment,
  validateExperimentIds,
} from '#ads/google/a4a/traffic-experiments';
import {
  AMP_EXPERIMENT_ATTRIBUTE,
  EXPERIMENT_ATTRIBUTE,
} from '#ads/google/a4a/utils';

describes.sandboxed('all-traffic-experiments-tests', {}, () => {
  describe('#validateExperimentIds', () => {
    it('should return true for empty list', () => {
      expect(validateExperimentIds([])).to.be.true;
    });

    it('should return true for a singleton numeric list', () => {
      expect(validateExperimentIds(['3'])).to.be.true;
    });

    it('should return false for a singleton non-numeric list', () => {
      expect(validateExperimentIds(['blargh'])).to.be.false;
      expect(validateExperimentIds([''])).to.be.false;
    });

    it('should return true for a multi-item valid list', () => {
      expect(validateExperimentIds(['0', '1', '2', '3'])).to.be.true;
    });

    it('should return false for a multi-item invalid list', () => {
      expect(validateExperimentIds(['0', '1', 'k2', '3'])).to.be.false;
    });
  });

  describe('#addExperimentIdToElement', () => {
    it('should add attribute when there is none present to begin with', () => {
      const element = document.createElement('div');
      expect(element.getAttribute(EXPERIMENT_ATTRIBUTE)).to.not.be.ok;
      addExperimentIdToElement('3', element);
      expect(element.getAttribute(EXPERIMENT_ATTRIBUTE)).to.equal('3');
    });

    it('should append experiment to already valid single experiment', () => {
      const element = document.createElement('div');
      element.setAttribute(EXPERIMENT_ATTRIBUTE, '99');
      addExperimentIdToElement('3', element);
      expect(element.getAttribute(EXPERIMENT_ATTRIBUTE)).to.equal('99,3');
    });

    it('should do nothing to already valid single experiment', () => {
      const element = document.createElement('div');
      element.setAttribute(EXPERIMENT_ATTRIBUTE, '99');
      addExperimentIdToElement(undefined, element);
      expect(element.getAttribute(EXPERIMENT_ATTRIBUTE)).to.equal('99');
    });

    it('should append experiment to already valid multiple experiments', () => {
      const element = document.createElement('div');
      element.setAttribute(EXPERIMENT_ATTRIBUTE, '99,77,11,0122345');
      addExperimentIdToElement('3', element);
      expect(element.getAttribute(EXPERIMENT_ATTRIBUTE)).to.equal(
        '99,77,11,0122345,3'
      );
    });

    it('should should replace existing invalid experiments', () => {
      const element = document.createElement('div');
      element.setAttribute(EXPERIMENT_ATTRIBUTE, '99,14,873,k,44');
      addExperimentIdToElement('3', element);
      expect(element.getAttribute(EXPERIMENT_ATTRIBUTE)).to.equal('3');
    });
  });

  describe('#addAmpExperimentIdToElement', () => {
    it('should add attribute when there is none present to begin with', () => {
      const element = document.createElement('div');
      expect(element.getAttribute(AMP_EXPERIMENT_ATTRIBUTE)).to.not.be.ok;
      addAmpExperimentIdToElement('3', element);
      expect(element.getAttribute(AMP_EXPERIMENT_ATTRIBUTE)).to.equal('3');
    });

    it('should append experiment to already valid single experiment', () => {
      const element = document.createElement('div');
      element.setAttribute(AMP_EXPERIMENT_ATTRIBUTE, '99');
      addAmpExperimentIdToElement('3', element);
      expect(element.getAttribute(AMP_EXPERIMENT_ATTRIBUTE)).to.equal('99,3');
    });

    it('should do nothing to already valid single experiment', () => {
      const element = document.createElement('div');
      element.setAttribute(AMP_EXPERIMENT_ATTRIBUTE, '99');
      addAmpExperimentIdToElement(undefined, element);
      expect(element.getAttribute(AMP_EXPERIMENT_ATTRIBUTE)).to.equal('99');
    });

    it('should append experiment to already valid multiple experiments', () => {
      const element = document.createElement('div');
      element.setAttribute(AMP_EXPERIMENT_ATTRIBUTE, '99,77,11,0122345');
      addAmpExperimentIdToElement('3', element);
      expect(element.getAttribute(AMP_EXPERIMENT_ATTRIBUTE)).to.equal(
        '99,77,11,0122345,3'
      );
    });

    it('should should replace existing invalid experiments', () => {
      const element = document.createElement('div');
      element.setAttribute(AMP_EXPERIMENT_ATTRIBUTE, '99,14,873,k,44');
      addAmpExperimentIdToElement('3', element);
      expect(element.getAttribute(AMP_EXPERIMENT_ATTRIBUTE)).to.equal('3');
    });
  });

  describe('#isInExperiment', () => {
    it('should return false for empty element and any query', () => {
      const element = document.createElement('div');
      expect(isInExperiment(element, '')).to.be.false;
      expect(isInExperiment(element, null)).to.be.false;
      expect(isInExperiment(element, 'frob')).to.be.false;
    });
    it('should return false for empty attribute and any query', () => {
      const element = document.createElement('div');
      element.setAttribute(EXPERIMENT_ATTRIBUTE, '');
      expect(isInExperiment(element, '')).to.be.false;
      expect(isInExperiment(element, null)).to.be.false;
      expect(isInExperiment(element, 'frob')).to.be.false;
    });
    it('should return false for real data string but mismatching query', () => {
      const element = document.createElement('div');
      element.setAttribute(EXPERIMENT_ATTRIBUTE, 'frob,gunk,zort');
      expect(isInExperiment(element, 'blub')).to.be.false;
      expect(isInExperiment(element, 'ort')).to.be.false;
      expect(isInExperiment(element, 'fro')).to.be.false;
      expect(isInExperiment(element, 'gunk,zort')).to.be.false;
    });
    it('should return true for singleton data and matching query', () => {
      const element = document.createElement('div');
      element.setAttribute(EXPERIMENT_ATTRIBUTE, 'frob');
      expect(isInExperiment(element, 'frob')).to.be.true;
    });
    it('should return true for matching query', () => {
      const element = document.createElement('div');
      element.setAttribute(EXPERIMENT_ATTRIBUTE, 'frob,gunk,zort');
      expect(isInExperiment(element, 'frob')).to.be.true;
      expect(isInExperiment(element, 'gunk')).to.be.true;
      expect(isInExperiment(element, 'zort')).to.be.true;
    });
  });
});
