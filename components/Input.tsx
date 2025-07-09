import { forwardRef } from 'react';
import { Text, TextInput, View } from 'react-native';

import { cn } from '../lib/utils';

export interface InputProps extends React.ComponentPropsWithoutRef<typeof TextInput> {
  label?: string;
  labelClasses?: string;
  inputClasses?: string;
}
const Input = forwardRef<React.ElementRef<typeof TextInput>, InputProps>(
  ({ className, label, labelClasses, inputClasses, ...props }, ref) => (
    <View className={cn('flex flex-col gap-1.5', className)}>
      {label && <Text className={cn('font-poppinsRegular text-base', labelClasses)}>{label}</Text>}
      <TextInput
        className={cn(
          inputClasses,
          'w-4/5 rounded-lg border border-input bg-background px-4 py-2.5 text-base text-foreground placeholder:justify-center placeholder:font-poppinsRegular focus:border-blue-800 focus:ring-1 focus:ring-blue-800 dark:bg-foreground dark:text-background dark:placeholder:text-gray-400'
        )}
        {...props}
      />
    </View>
  )
);

export { Input };
