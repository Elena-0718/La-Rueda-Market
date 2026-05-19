import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({
  name: 'MatchPassword',
  async: false,
})
export class MatchPasswordConstraint
  implements ValidatorConstraintInterface
{
  validate(
    confirmPassword: string,
    args: ValidationArguments,
  ): boolean {
    const [propertyToCompare] = args.constraints;
    const password = (args.object as any)[propertyToCompare];

    return confirmPassword === password;
  }

  defaultMessage(): string {
    return 'La contraseña y la confirmación de la contraseña no coinciden.';
  }
}

export function MatchPassword(
  propertyToCompare: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [propertyToCompare],
      validator: MatchPasswordConstraint,
    });
  };
}