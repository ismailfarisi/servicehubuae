import { Star } from "lucide-react";

/** Five read-only stars, filled up to `rating` (rounded to the nearest whole star). */
export function Stars({
	rating,
	size = 16,
	label,
}: { rating: number; size?: number; label: string }) {
	const filled = Math.round(rating);
	return (
		<span
			className="inline-flex items-center gap-0.5"
			role="img"
			aria-label={label}
		>
			{[1, 2, 3, 4, 5].map((n) => (
				<Star
					key={n}
					aria-hidden="true"
					style={{ width: size, height: size }}
					className={
						n <= filled
							? "fill-amber-400 text-amber-400"
							: "fill-nl-pearl text-nl-cacao/20"
					}
				/>
			))}
		</span>
	);
}
