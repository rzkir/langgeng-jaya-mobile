import Svg, { Path } from 'react-native-svg';

export function HamburgerSvg({ color = '#000' }: { color?: string }) {
    return (
        <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
            <Path d="M4 7H20" stroke={color} strokeWidth={2.5} strokeLinecap="round" />
            <Path d="M4 12H20" stroke={color} strokeWidth={2.5} strokeLinecap="round" />
            <Path d="M4 17H20" stroke={color} strokeWidth={2.5} strokeLinecap="round" />
        </Svg>
    );
}