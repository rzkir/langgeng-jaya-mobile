import Svg, { Path } from 'react-native-svg';

export function CloseSvg({ color = '#000' }: { color?: string }) {
    return (
        <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
            <Path d="M6 6L18 18" stroke={color} strokeWidth={2.5} strokeLinecap="round" />
            <Path d="M18 6L6 18" stroke={color} strokeWidth={2.5} strokeLinecap="round" />
        </Svg>
    );
}