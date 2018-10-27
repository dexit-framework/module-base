/*
 * dexit/module-base
 *
 * @author Jiri Hybek <jiri@hybek.cz>
 * @license Apache-2.0
 */

/**
 * Ajv.ErrorObject
 */
interface IAjvErrorObject {
	keyword: string;
	dataPath: string;
	schemaPath: string;
	params: any;
	// Added to validation errors of propertyNames keyword schema
	propertyName?: string;
	// Excluded if messages set to false.
	message?: string;
	// These are added with the `verbose` option.
	schema?: any;
	parentSchema?: object;
	data?: any;
}

/**
 * Interface representing assertion error
 */
export interface IAssertionError {
	message: string|Array<IAjvErrorObject>;
	expected?: any;
	actual?: any;
}

/**
 * Task run environment
 */
export interface IRunEnv {
	document: {
		filename: string;
		fullPath: string;
		name: string;
	};
	taskPath: string;
	debug: boolean;
}

/**
 * Test command interface
 */
export interface ITestCommand {
	/** Command description */
	description: string;

	/** Arguments JSON schema */
	argsSchema: any;

	/** Expect JSON schema - mandatory when expect function is defined */
	expectSchema?: any;

	/** Validates arguments */
	validateArgs?: (args: any) => Array<IAssertionError>;

	/** Validates expect */
	validateExpect?: (args: any) => Array<IAssertionError>;

	/** Command run handler */
	run: (args: any, onReady: () => void, env: IRunEnv) => Promise<any>;

	/** Command expect handler */
	expect?: (args: any, result: any, env: IRunEnv) => Array<IAssertionError>;

	/** Return user-friendly label of task based on arguments */
	getLabel?: (runArgs: any, expectArgs: any) => string;
}

/**
 * Module interface
 */
export interface ITestModule {
	/** Module name */
	name: string;

	/** Module description */
	description: string;

	/** Defaults JSON schema */
	defaultsSchema: any;

	/** Commands provided by the module */
	commands: { [K: string]: ITestCommand };
}
