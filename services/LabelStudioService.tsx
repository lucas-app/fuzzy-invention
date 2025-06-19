import React from 'react';
import LabelStudioService from './LabelStudioService';

// This is just a wrapper to make the export compatible with React's expectations
const LabelStudioServiceComponent = () => {
  return null; // This component doesn't render anything
};

// Attach all service methods to the component
Object.assign(LabelStudioServiceComponent, LabelStudioService);

export default LabelStudioServiceComponent; 