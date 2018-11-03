/*
 * dexit/module-base
 *
 * @author Jiri Hybek <jiri@hybek.cz>
 * @license Apache-2.0
 */

import * as Ajv from "ajv";

import { ITestModule, IRunEnv, IAssertionError } from "./interfaces";
import { rejects } from "assert";

/**
 * Error class thrown when module arg validation fails
 */
export class IModuleTestRunnerArgsError extends Error {

	public constructor(message: string, public errors: Array<IAssertionError>) {

		super(message);

	}

}

/**
 * Return an object with promise and resolve function to be able to resolve promise after some delay
 */
function promiseWait() {

	let resolved = false;

	return {
		promise: new Promise((resolve) => {

			const timer = setInterval(() => {

				if (!resolved) return;

				clearInterval(timer);
				resolve();

			}, 0);

		}),
		resolve: () => resolved = true
	};

}

/**
 * Class which provides a test interface for a module
 */
export class ModuleTestRunner {

	protected ajv: Ajv.Ajv;

	protected defaultsValidator: Ajv.ValidateFunction;
	protected argsValidators: { [K: string]: Ajv.ValidateFunction } = {};
	protected expectValidators: { [K: string]: Ajv.ValidateFunction } = {};

	/**
	 * Module Test Runner constructor
	 *
	 * @param mod Module instance
	 */
	public constructor(protected mod: ITestModule) {

		// Setup AJV
		this.ajv = new Ajv({
			useDefaults: true,
			allErrors: true,
			removeAdditional: true
		});

		// Validate module interface
		this.validateModuleObject(mod);

		// Set validators
		try {

			this.defaultsValidator = this.ajv.compile(mod.defaultsSchema);

			for (const i in mod.commands) {

				const cmd = mod.commands[i];

				if (cmd.argsSchema)
					this.argsValidators[i] = this.ajv.compile(cmd.argsSchema);

				if (cmd.expectSchema)
					this.expectValidators[i] = this.ajv.compile(cmd.expectSchema);

			}

		} catch (err) {

			throw new Error(`Module '' JSON schema(s) are not valid: ` + err);

		}

	}

	/**
	 * Validates module definition object
	 *
	 * @param id Module idenitifer (for debugging, eg. filename or so)
	 * @param mod Module object
	 */
	protected validateModuleObject(mod: any) {

		// Validate interface
		if (!(mod instanceof Object))
			throw new Error(`Module does not export a configuration object.`);

		if (!mod.name)
			throw new Error(`Module definition must has a 'name' property.`);

		if (!mod.description || (mod.description && mod.description.trim() === ""))
			throw new Error(`Module definition must has a 'description' property set (and not empty).`);

		if (!mod.defaultsSchema)
			throw new Error(`Module definition must has a 'defaultsSchema' property which must be a valid JSON schema object.`);

		if (!mod.commands)
			throw new Error(`Module definition must has a 'commands' property.`);

		if (!(mod.commands instanceof Object))
			throw new Error(`Module property 'commands' must be an object.`);

		// Validate commands
		for (const i in mod.commands) {

			const cmd = mod.commands[i];

			if (!(cmd instanceof Object))
				throw new Error(`Module command '${i}' must be an object.`);

			if (!cmd.description)
				throw new Error(`Module command '${i}' definition must has 'description' property.`);

			if (!cmd.run)
				throw new Error(`Module command '${i}' definition must has 'run' property.`);

			if (typeof cmd.run !== "function")
				throw new Error(`Module command '${i}' definition property 'run' must be a function.`);

			if (cmd.expect && typeof cmd.expect !== "function")
				throw new Error(`Module command '${i}' definition property 'expect' must be a function.`);

			if (cmd.getLabel && typeof cmd.getLabel !== "function")
				throw new Error(`Module command '${i}' definition property 'getLabel' must be a function.`);

			if (!cmd.argsSchema)
				throw new Error(`Module command '${i}' definition must has 'argsSchema' property which must be a valid JSON schema object.`);

			if (cmd.expect && !cmd.expectSchema)
				throw new Error(`Module command '${i}' definition must has 'expectSchema' property which must be a valid JSON schema object.`);

			if (cmd._argsValidator)
				throw new Error(`Module command '${i}' cannot has '_argsValidator' property because it is reserved.`);

			if (cmd._expectValidator)
				throw new Error(`Module command '${i}' cannot has '_expectValidator' property because it is reserved.`);

		}

	}

	/**
	 * Executes module run handler
	 *
	 * @param command Command to execute
	 * @param runArgs Run arguments
	 * @param env Run environment
	 */
	public async run(command: string, runArgs: any, env: IRunEnv) {

		// Resolve command
		const cmd = this.mod.commands[command];

		if (!cmd)
			throw new Error(`Command "${command}" is not defined.`);

		// Validate args
		let argErrors: Array<IAssertionError> = [];

		if (!this.argsValidators[command](runArgs))
			argErrors.push({
				message: this.argsValidators[command].errors
			});

		if (cmd.validateArgs)
			argErrors = argErrors.concat(cmd.validateArgs(runArgs));

		if (argErrors.length > 0)
			throw new IModuleTestRunnerArgsError("Failed to validate command arguments", argErrors);

		// Run
		const readyPromise = promiseWait();
		const runPromise = cmd.run(runArgs, () => readyPromise.resolve(), env);

		await readyPromise;
		return await runPromise;

	}

	/**
	 * Executes module expect handler
	 *
	 * @param command Command to execute
	 * @param expectArgs Expect arguments
	 * @param result Result form run handler
	 * @param env Run environment
	 */
	public expect(command: string, expectArgs: any, result: any, env: IRunEnv) {

			// Resolve command
			const cmd = this.mod.commands[command];

			if (!cmd)
				throw new Error(`Command "${command}" is not defined.`);

			if (!cmd.expect)
				throw new Error(`Command "${command}" has no expect handler.`);

			// Validate args
			let argErrors: Array<IAssertionError> = [];

			if (!this.expectValidators[command](expectArgs))
				argErrors.push({
					message: this.expectValidators[command].errors
				});

			if (cmd.validateExpect)
				argErrors = argErrors.concat(cmd.validateExpect(expectArgs));

			if (argErrors.length > 0)
				throw new IModuleTestRunnerArgsError("Failed to validate command arguments", argErrors);

			// Run expect handler
			return cmd.expect(expectArgs, result, env);

	}

}
