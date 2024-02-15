export enum LogLevel {
	None = 0,
	Error = 1,
	Warn = 2,
	Log = 3,
	Info = 4,
	Debug = 5,
	All = 1000,
}

export class Logger {
	level: LogLevel = LogLevel.All;

	error(...msg: any[]): void {
		if (LogLevel.Error <= this.level) console.error(...msg);
	}

	warn(...msg: any[]): void {
		if (LogLevel.Warn <= this.level) console.warn(...msg);
	}

	log(...msg: any[]): void {
		if (LogLevel.Log <= this.level) console.log(...msg);
	}

	info(...msg: any[]): void {
		if (LogLevel.Info <= this.level) console.log(...msg);
	}

	debug(...msg: any[]): void {
		if (LogLevel.Debug <= this.level) console.log(...msg);
	}
}

export const logger = new Logger();
