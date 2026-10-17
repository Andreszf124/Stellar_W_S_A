import { type ReactNode, type SVGProps } from "react"

type IconProps = Omit<SVGProps<SVGSVGElement>, "children"> & { size?: number }

const Base = ({
	size = 20,
	children,
	...rest
}: IconProps & { children: ReactNode }) => (
	<svg
		width={size}
		height={size}
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth={1.75}
		strokeLinecap="round"
		strokeLinejoin="round"
		aria-hidden="true"
		focusable="false"
		{...rest}
	>
		{children}
	</svg>
)

export const BeanIcon = (p: IconProps) => (
	<Base {...p}>
		<ellipse cx="12" cy="12" rx="6" ry="9" transform="rotate(35 12 12)" />
		<path d="M8 6c3 2 1 5 4 6s1 4 4 6" />
	</Base>
)

export const SearchIcon = (p: IconProps) => (
	<Base {...p}>
		<circle cx="11" cy="11" r="6.5" />
		<path d="M16 16l4.5 4.5" />
	</Base>
)

export const PlusIcon = (p: IconProps) => (
	<Base {...p}>
		<path d="M12 5v14M5 12h14" />
	</Base>
)

export const TransferIcon = (p: IconProps) => (
	<Base {...p}>
		<path d="M4 8h15M15 4l4 4-4 4" />
		<path d="M20 16H5M9 12l-4 4 4 4" />
	</Base>
)

export const AlertIcon = (p: IconProps) => (
	<Base {...p}>
		<circle cx="12" cy="12" r="9" />
		<path d="M12 7.5v5M12 16v.5" />
	</Base>
)

export const CheckIcon = (p: IconProps) => (
	<Base {...p}>
		<circle cx="12" cy="12" r="9" />
		<path d="M8 12.5l3 3 5-6" />
	</Base>
)

export const PinIcon = (p: IconProps) => (
	<Base {...p}>
		<path d="M12 21s6-5.5 6-10a6 6 0 0 0-12 0c0 4.5 6 10 6 10z" />
		<circle cx="12" cy="11" r="2" />
	</Base>
)

export const CalendarIcon = (p: IconProps) => (
	<Base {...p}>
		<rect x="4" y="5" width="16" height="15" rx="2" />
		<path d="M4 10h16M9 3v4M15 3v4" />
	</Base>
)

export const ProcessIcon = (p: IconProps) => (
	<Base {...p}>
		<path d="M12 3c3 4 5 6 5 9a5 5 0 0 1-10 0c0-3 2-5 5-9z" />
	</Base>
)

export const UserIcon = (p: IconProps) => (
	<Base {...p}>
		<circle cx="12" cy="8" r="4" />
		<path d="M4.5 20a7.5 7.5 0 0 1 15 0" />
	</Base>
)

export const SpinnerIcon = (p: IconProps) => (
	<Base {...p}>
		<path d="M12 3a9 9 0 1 0 9 9" />
	</Base>
)
