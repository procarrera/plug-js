import {
    JsonValue,
    SdkFacade,
    SdkFacadeConfiguration as Configuration,
    EvaluationFacadeOptions as EvaluationOptions,
    SessionFacade,
    TrackerFacade,
    UserFacade,
    ExternalEvent,
    ExternalEventPayload,
    ExternalEventType,
} from '@croct-tech/sdk';

class CroctPlug {
    private facade?: SdkFacade;

    public plug(configuration: Configuration): void {
        if (this.facade !== undefined) {
            const logger = this.facade.getLogger();

            logger.info('Croct is already plugged in.');

            return;
        }

        this.facade = SdkFacade.init(configuration);
    }

    private get instance(): SdkFacade {
        if (this.facade === undefined) {
            throw new Error('Croct is not plugged in.');
        }

        return this.facade;
    }

    public get tracker(): TrackerFacade {
        return this.instance.tracker;
    }

    public get user(): UserFacade {
        return this.instance.user;
    }

    public get session(): SessionFacade {
        return this.instance.session;
    }

    public isAnonymous(): boolean {
        return this.instance.context.isAnonymous();
    }

    public getUserId(): string | null {
        return this.instance.context.getUser();
    }

    public identify(userId: string): void {
        this.instance.identify(userId);
    }

    public anonymize(): void {
        this.instance.anonymize();
    }

    public setToken(token: string): void {
        this.instance.setToken(token);
    }

    public unsetToken(): void {
        this.instance.unsetToken();
    }

    public track<T extends ExternalEventType>(type: T, payload: ExternalEventPayload<T>): Promise<ExternalEvent<T>> {
        return this.instance.track(type, payload);
    }

    public evaluate(expression: string, options: EvaluationOptions = {}): Promise<JsonValue> {
        return this.instance.evaluate(expression, options);
    }

    public async unplug(): Promise<void> {
        if (this.facade === undefined) {
            return;
        }

        const logger = this.instance.getLogger();

        try {
            await this.facade.close();
        } finally {
            delete this.facade;

            logger.info('🔌 Croct has been unplugged.');
        }
    }
}

export default new CroctPlug();
