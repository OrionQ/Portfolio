import clsx from "clsx";
import styles from './toggle.module.css';
import { useEffect, useRef, useState } from "react";

interface ToggleButtonProps {
    options: string[];
    onChange: (selected: string) => void;
}

export default function ToggleButton({ options, onChange }: ToggleButtonProps) {
    const [selectedOption, setSelectedOption] = useState(options[0]);
    const labelRefs = useRef<(HTMLLabelElement | null)[]>([]);
    const [sliderWidth, setSliderWidth] = useState<number>(100);

    const handleChange = (option: string) => {
        setSelectedOption(option);
        onChange(option);
    };

    const updateSliderWidth = () => {
        const selectedLabel = labelRefs.current.find((label) => label?.textContent === selectedOption);
        if (selectedLabel) {
            setSliderWidth(selectedLabel.offsetWidth);
        }
    };

    useEffect(() => {
        updateSliderWidth(); // Update slider width when option changes

        const handleResize = () => {
            updateSliderWidth();
        };

        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, [selectedOption]);

    return (
        <div className={styles.container}>
            <div
                className={clsx(styles.slider)}
                style={{
                    width: `${sliderWidth - 8}px`, // Dynamically set width
                    left: `calc(${labelRefs.current.find((label) => label?.textContent === selectedOption)?.offsetLeft}px + 4px)`
                }}
            />
            {options.map((option, index) => (
                <label
                    key={option}
                    ref={(el) => { labelRefs.current[index] = el; }} // Store reference to the label
                    className={clsx(
                        styles.label,
                        selectedOption === option ? styles.active : styles.inactive,
                        "whitespace-nowrap"
                    )}
                >
                    <input
                        type="radio"
                        name="toggle"
                        value={option}
                        checked={selectedOption === option}
                        onChange={() => handleChange(option)}
                        className="sr-only"
                    />
                    {option}
                </label>
            ))}
        </div>
    );
}