import React, { ReactNode } from 'react';
import { FormControl, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

interface FormFieldWrapperProps {
    label: string;
    children: ReactNode;
}

const FormFieldWrapper = ({ label, children }: FormFieldWrapperProps) => {
    return (
        <FormItem>
            <FormLabel className="text-16 sm:text-18 font-bold text-white-1 flex items-center gap-3 cursor-pointer">
                <div className="h-6 w-1.5 bg-gradient-to-t from-orange-1 to-orange-400 rounded-full" />
                {label}
            </FormLabel>
            <FormControl>
                {children}
            </FormControl>
            <FormMessage className="text-white-1" />
        </FormItem>
    );
};

export default FormFieldWrapper;