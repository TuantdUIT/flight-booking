"use client";
import { AlertCircle, X } from "lucide-react";
import { cn } from "@/core/utils";

interface ErrorBannerProps {
	message: string;
	onDismiss?: () => void;
	className?: string;
}

export function ErrorBanner({
	message,
	onDismiss,
	className,
}: ErrorBannerProps) {
	return (
		<div
			className={cn(
				"flex items-center gap-3 rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-destructive",
				className,
			)}
			role="alert"
		>
			<AlertCircle className="h-5 w-5 flex-shrink-0" />
			<p className="text-sm font-medium flex-1">{message}</p>
			{onDismiss && (
				<button
					onClick={onDismiss}
					className="flex-shrink-0 hover:bg-destructive/10 rounded p-1 transition-colors"
					aria-label="Dismiss"
				>
					<X className="h-4 w-4" />
				</button>
			)}
		</div>
	);
}
