/*
 * dexit
 *
 * @author Jiri Hybek <jiri@hybek.cz>
 * @license Apache-2.0
 */

import "jest";

import { ModuleTestRunner, IModuleTestRunnerArgsError } from "../src/TestRunner";
import { ITestModule, IRunEnv } from "../src";

describe("ModuleTestRunner", () => {

	const sampleEnv: IRunEnv = {
		debug: false,
		taskPath: "task",
		document: {
			name: "test",
			filename: __filename,
			fullPath: __filename
		}
	};

	const validModule: ITestModule = {
		name: "Module",
		description: "...",
		defaultsSchema: {
			type: "object"
		},
		commands: {
			test: {
				description: "Does something",
				argsSchema: {
					type: "object",
					required: [ "test" ],
					properties: {
						test: {
							type: "string"
						}
					}
				},
				expectSchema: {
					type: "object",
					required: [ "test" ],
					properties: {
						test: {
							type: "string"
						}
					}
				},
				getLabel: () => "Label",

				run: async (args, onReady, env) => {

					onReady();

					return {
						args: args,
						env: env
					};

				},

				expect: (args, result, env) => {

					return [];

				}
			},
			noExpect: {
				description: "Command with not expect",
				argsSchema: {},
				run: async (args, onReady, env) => {
					onReady();
					return {};
				}
			}
		}
	};

	const invalidModule = {};

	it("Should construct with a valid module", () => {

		const runner = new ModuleTestRunner(validModule);

	});

	it("Construct with an invalid module should throw", () => {

		expect(() => {

			const runner = new ModuleTestRunner(invalidModule as ITestModule);

		}).toThrow();

	});

	it("Should execute run handler", async () => {

		const runner = new ModuleTestRunner(validModule);

		const args = {
			test: "test"
		};

		const res = await runner.run("test", args, sampleEnv);

		expect(res).toEqual({
			args: args,
			env: sampleEnv
		});

	});

	it("Should execute expect handler", async () => {

		const runner = new ModuleTestRunner(validModule);

		const args = {
			test: "test"
		};

		const result = {
			test: "test"
		};

		const res = await runner.expect("test", args, result, sampleEnv);

		expect(res).toEqual([]);

	});

	it("Should throw when trying to execute undefied expect handler", () => {

		expect(() => {

			const runner = new ModuleTestRunner(validModule);

			runner.expect("noExpect", {}, {}, sampleEnv);

		}).toThrow();

	});

	it("Should throw when run arguments are not valid", async () => {

		const runner = new ModuleTestRunner(validModule);

		await expect(runner.run("test", {}, sampleEnv)).rejects.toBeDefined();

	});

	it("Should throw when expect arguments are not valid", () => {

		const runner = new ModuleTestRunner(validModule);

		expect(() => runner.expect("test", {}, {}, sampleEnv)).toThrow();

	});

});
