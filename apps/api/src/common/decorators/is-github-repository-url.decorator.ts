import {
  registerDecorator,
  ValidatorConstraint,
  ValidatorConstraintInterface
} from "class-validator";
import type { ValidationArguments, ValidationOptions } from "class-validator";
import { parseGitHubUrl } from "@redevops-lab/analyzer";

@ValidatorConstraint({ name: "isGitHubRepositoryUrl", async: false })
class IsGitHubRepositoryUrlConstraint implements ValidatorConstraintInterface {
  validate(value: unknown): boolean {
    return typeof value === "string" && parseGitHubUrl(value) !== null;
  }

  defaultMessage(_args: ValidationArguments): string {
    return "url must be a valid GitHub repository URL like https://github.com/owner/repo";
  }
}

export function IsGitHubRepositoryUrl(validationOptions?: ValidationOptions) {
  return function registerGitHubRepositoryUrl(target: object, propertyName: string): void {
    registerDecorator({
      target: target.constructor,
      propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsGitHubRepositoryUrlConstraint
    });
  };
}
