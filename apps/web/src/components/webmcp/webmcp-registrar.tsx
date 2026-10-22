"use client";

import {
	registerServiceHubUAEWebMcpServiceWorker,
	registerServiceHubUAEWebMcpTools,
} from "@/lib/webmcp";
import { useLocale } from "next-intl";
import { useEffect } from "react";

export function WebMcpRegistrar() {
	const locale = useLocale();

	useEffect(() => {
		return registerServiceHubUAEWebMcpTools({ locale });
	}, [locale]);

	useEffect(() => {
		void registerServiceHubUAEWebMcpServiceWorker();
	}, []);

	return null;
}
