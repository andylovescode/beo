/**
 * Minimally bad and maximally good logging framework
 *
 * @example
 * ```typescript
 * const logger = new Logger("@beo/example")
 *
 * logger.info("test")
 * logger.error(["a", "b"])
 * logger.warn({ key: 1, value: 2 })
 * ```
 *
 * @module log
 */

import { getGlobalReference } from "@beo/global"

//#region environment
/**
 * A log rendering method
 */
export type LogEnvironment = "ci" | "web" | "terminal"

/**
 * Figure out the log rendering method
 */
export function determineLogEnvironment(): LogEnvironment {
	if (!("Deno" in globalThis)) {
		return "web"
	}

	return Deno.noColor ? "ci" : "terminal"
}
//#endregion
//#region config
/**
 * A configuration for Loggers
 */
export class LoggerConfig {
	/**
	 * The rendering method of the logs
	 */
	environment: LogEnvironment = determineLogEnvironment()
	/**
	 * Amount of characters to align prefixes to
	 */
	leftEdgeSize: number = 32
	/**
	 * A list of overrides for minimum log severities
	 * @internal
	 */
	minimumSeverityOverrides: [string, LogSeverity][] = []
	/**
	 * The default minimum log severity
	 */
	minSeverity: LogSeverity = "info"

	/**
	 * Decrease the minimum log severity for logs matching a keyword
	 * @param keyword
	 * @param severity
	 */
	showLogs(keyword: string, severity: LogSeverity) {
		this.minimumSeverityOverrides.push([keyword, severity])
	}
}

type LoggerContainer = {
	value: LoggerConfig
}

const loggerConfig = getGlobalReference({
	author: "beo",
	ref: "logger-instance",
	version: 0,
	default(): LoggerContainer {
		return { value: new LoggerConfig() }
	},
})

/**
 * Update the global logger configuration
 * @param config The new logger configuration
 */
export function setLoggerConfig(config: LoggerConfig) {
	loggerConfig.value = config
}

/**
 * This is marked subtle as it's a tricky API, do not modify the result of this, as it may not have all the options you expect
 * @see setLoggerConfig
 * @returns the global logger configuration
 */
export function subtle_getLoggerConfig(): LoggerConfig {
	return loggerConfig.value
}
//#endregion
//#region severity
/**
 * The type (and inferred level of importance) from a log
 */
export type LogSeverity = "info" | "debug" | "warn" | "error"

/**
 * Prioritization order for log severities
 */
export const severityOrder: LogSeverity[] = [
	"debug",
	"info",
	"warn",
	"error",
]
//#endregion
//#region log options
/**
 * Options for a log
 */
export interface LogOptions {
	message: string
	severity: LogSeverity
}

/**
 * @see LogOptions
 */
export type LogOptionsWithoutSeverity = Omit<LogOptions, "severity">

/**
 * The arguments for logging functions
 */
export type LogArguments = [any, Omit<LogOptionsWithoutSeverity, "message">] | [
	any,
]

function logArgumentsToProps(
	severity: LogSeverity,
	args: LogArguments,
): LogOptions {
	const [message, opts = {}] = args

	return {
		...opts,
		message: formatObjectForLogging(message),
		severity,
	}
}

//#endregion
//#region printing
function formatObjectForLogging(obj: unknown): string {
	if (Array.isArray(obj)) {
		return obj.map(formatObjectForLogging).join(" ")
	}

	if (typeof obj === "string") return obj

	if (typeof obj === "object" && obj != null) {
		if (obj.toString !== Object.prototype.toString) {
			return obj.toString()
		} else {
			let result = "("

			for (const key in obj) {
				result += `${key}=${formatObjectForLogging((obj as any)[key])},`
			}

			result += `)`
		}
	}

	return JSON.stringify(obj)
}

/**
 * A class for creating logs
 */
export class Logger {
	#path: string
	get #config() {
		return subtle_getLoggerConfig()
	}

	constructor(path: string) {
		this.#path = path
	}

	#log(options: LogOptions) {
		let minimumSeverityNeeded = severityOrder.indexOf(
			this.#config.minSeverity,
		)
		const severityIndex = severityOrder.indexOf(options.severity)

		for (const [keyword, severity] of this.#config.minimumSeverityOverrides) {
			let ok = false

			if (this.#path.toLowerCase().includes(keyword.toLowerCase())) ok = true
			if (options.message.toLowerCase().includes(keyword.toLowerCase())) {
				ok = true
			}

			if (!ok) continue

			minimumSeverityNeeded = Math.min(
				minimumSeverityNeeded,
				severityOrder.indexOf(severity),
			)
		}

		if (severityIndex < minimumSeverityNeeded) return

		let severitySymbol: string = options.severity

		if (severitySymbol === "debug") {
			severitySymbol = "%"
		}
		if (severitySymbol === "info") {
			severitySymbol = "*"
		}
		if (severitySymbol === "warn") {
			severitySymbol = "$"
		}
		if (severitySymbol === "error") {
			severitySymbol = "!"
		}

		let prefix = `${severitySymbol}[${this.#path}]: `

		prefix = prefix.padStart(this.#config.leftEdgeSize, " ") // fixme: p50 /// pull in unneccessary dependency on leftpad :^)

		const text = prefix + options.message

		if (options.severity === "debug") {
			console.debug(text)
		} else if (options.severity === "info") {
			console.info(text)
		} else if (options.severity === "warn") {
			console.warn(text)
		} else if (options.severity === "error") {
			console.error(text)
		}
	}

	/**Print a debugging message */
	debug(...args: LogArguments) {
		this.#log(logArgumentsToProps("debug", args))
	}
	/**Print an informational message */
	info(...args: LogArguments) {
		this.#log(logArgumentsToProps("info", args))
	}
	/**Print a warning message */
	warn(...args: LogArguments) {
		this.#log(logArgumentsToProps("warn", args))
	}
	/**Print an error message */
	error(...args: LogArguments) {
		this.#log(logArgumentsToProps("error", args))
	}
}
//#endregion
