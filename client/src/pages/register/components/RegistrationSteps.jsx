import React from 'react';
import Icon from '../../../components/AppIcon';

const RegistrationSteps = ({ currentStep, totalSteps }) => {
  const steps = [
    { number: 1, title: 'Account Info', description: 'Basic details' },
    { number: 2, title: 'Financial Setup', description: 'Wallets & currency' },
    { number: 3, title: 'Preferences', description: 'Categories & settings' }
  ];

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        {steps?.map((step, index) => (
          <React.Fragment key={step?.number}>
            <div className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-financial ${
                currentStep >= step?.number
                  ? 'bg-primary border-primary text-primary-foreground'
                  : currentStep === step?.number
                  ? 'border-primary text-primary bg-background' :'border-border text-muted-foreground bg-background'
              }`}>
                {currentStep > step?.number ? (
                  <Icon name="Check" size={16} />
                ) : (
                  <span className="text-sm font-medium">{step?.number}</span>
                )}
              </div>
              <div className="mt-2 text-center">
                <p className={`text-xs font-medium ${
                  currentStep >= step?.number ? 'text-foreground' : 'text-muted-foreground'
                }`}>
                  {step?.title}
                </p>
                <p className="text-xs text-muted-foreground hidden sm:block">
                  {step?.description}
                </p>
              </div>
            </div>
            {index < steps?.length - 1 && (
              <div className={`flex-1 h-0.5 mx-4 transition-financial ${
                currentStep > step?.number ? 'bg-primary' : 'bg-border'
              }`} />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default RegistrationSteps;