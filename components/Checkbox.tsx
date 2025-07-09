import { useCallback } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

import { cn } from '../lib/utils';

interface CheckboxProps extends React.ComponentPropsWithoutRef<typeof View> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  label?: string;
  labelClasses?: string;
  checkboxClasses?: string;
}

function Checkbox({
  checked = false,
  onCheckedChange,
  label,
  labelClasses,
  checkboxClasses,
  className,
  ...props
}: CheckboxProps) {
  const toggleCheckbox = useCallback(() => {
    onCheckedChange?.(!checked);
  }, [checked, onCheckedChange]);

  return (
    <View
      className={cn('flex flex-row items-center gap-2', className)}
      {...props}
    >
      <TouchableOpacity onPress={toggleCheckbox}>
        <View
          className={cn(
            'w-4 h-4 border border-gray-700 rounded bg-background dark:bg-gray-800 dark:text-foreground flex justify-center items-center',
            {
              'bg-foreground dark:bg-foreground': checked,
            },
            checkboxClasses
          )}
        >
          {checked && <Text className="text-background text-xs">✓</Text>}
        </View>
      </TouchableOpacity>
      {label && (
        <Text className={cn('text-primary dark:text-white font-poppinsRegular', labelClasses)}>{label}</Text>
      )}
    </View>
  );
}

export { Checkbox };
