import { type DocumentNode } from 'graphql';
import { type SetupWorker, type StartOptions } from 'msw/browser';
interface Options {
    mswStartOptions: StartOptions;
}
type Hooks = {
    after(fn: () => void | Promise<void>): void;
    afterEach(fn: () => void | Promise<void>): void;
    before(fn: () => void | Promise<void>): void;
    beforeEach(fn: () => void | Promise<void>): void;
};
export declare function setupEmberGraphqlMocking(schemaDocument: DocumentNode, providedOptions?: Options): Promise<void>;
export declare function setupGraphqlTest(hooks: Hooks): void;
export declare function mockResolvers(resolvers: object): void;
export declare function getWorker(): SetupWorker;
export declare function stopWorker(): void;
export {};
//# sourceMappingURL=index.d.ts.map