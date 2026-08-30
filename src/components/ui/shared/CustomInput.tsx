import React from "react";

interface InputProps {
  placeholder?: string;
}

type CustomInputProps = InputProps &
  Omit<React.ComponentPropsWithoutRef<"input">, "value" | "onChange" | "type"> & {
    value: string;
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    type?: string;
  };

const CustomInput: React.FC<CustomInputProps> = ({ value, onChange, type = "text", ...props }) => {
  return (
    <input
      type={type}
      placeholder="Enter Email, Student ID, or Club ID"
      value={value}
      onChange={onChange}
      {...props}
    />
  );
};

export default CustomInput;
