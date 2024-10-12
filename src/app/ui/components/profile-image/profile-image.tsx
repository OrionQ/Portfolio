import Image, { StaticImageData } from 'next/image';
import styles from './profile-image.module.css';

interface ProfileImageProps {
    src: StaticImageData;
    alt: string;
    width: number; // Desired width
    height: number; // Desired height
}

export default function ProfileImage({ src, alt, width, height }: ProfileImageProps) {
    return (
        <div className={styles.profileImgMask}>
            <Image
                src={src}
                alt={alt}
                width={width}
                height={height}
                className={styles.prfileImg}
                placeholder="blur"
            />
        </div>
    );
};
