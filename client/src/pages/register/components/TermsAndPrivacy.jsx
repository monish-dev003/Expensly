import React from 'react';
import { Checkbox } from '../../../components/ui/Checkbox';
import Icon from '../../../components/AppIcon';

const TermsAndPrivacy = ({ formData, updateFormData, errors }) => {
  return (
    <div className="space-y-4">
      <div className="bg-muted/50 rounded-lg p-4 border border-border">
        <div className="flex items-start space-x-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Icon name="Shield" size={20} className="text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-foreground mb-2">
              Your Privacy & Security
            </h3>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Your financial data is encrypted and stored securely</li>
              <li>• We never share your personal information with third parties</li>
              <li>• You can export or delete your data at any time</li>
              <li>• All transactions are processed with bank-level security</li>
            </ul>
          </div>
        </div>
      </div>
      <div className="space-y-3">
        <div className="flex items-start space-x-3">
          <Checkbox
            checked={formData?.acceptTerms}
            onChange={(e) => updateFormData({ acceptTerms: e?.target?.checked })}
            error={errors?.acceptTerms}
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm text-foreground">
              I agree to the{' '}
              <button
                type="button"
                className="text-primary hover:text-primary/80 underline transition-financial"
                onClick={() => window.open('/terms', '_blank')}
              >
                Terms of Service
              </button>
              {' '}and{' '}
              <button
                type="button"
                className="text-primary hover:text-primary/80 underline transition-financial"
                onClick={() => window.open('/privacy', '_blank')}
              >
                Privacy Policy
              </button>
            </p>
          </div>
        </div>

        <div className="flex items-start space-x-3">
          <Checkbox
            checked={formData?.acceptMarketing}
            onChange={(e) => updateFormData({ acceptMarketing: e?.target?.checked })}
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm text-foreground">
              I would like to receive helpful tips, product updates, and promotional emails from Expensly
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              You can unsubscribe at any time
            </p>
          </div>
        </div>
      </div>
      {errors?.acceptTerms && (
        <p className="text-sm text-error">{errors?.acceptTerms}</p>
      )}
    </div>
  );
};

export default TermsAndPrivacy;