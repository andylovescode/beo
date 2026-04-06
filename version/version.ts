export type Version = {
	epoch: number
	major: number
	minor: number
	patch: number
}

export function printVersion(version: Version): string {
	return `${
		version.major + version.epoch * 1000
	}.${version.minor}.${version.patch}`
}
