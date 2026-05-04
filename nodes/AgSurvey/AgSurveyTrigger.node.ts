import type {
	IHookFunctions,
	IWebhookFunctions,
	INodeType,
	INodeTypeDescription,
	IWebhookResponseData,
	IHttpRequestOptions,
	IDataObject,
	JsonObject,
} from 'n8n-workflow';
import { NodeApiError, NodeConnectionTypes } from 'n8n-workflow';
import { CONFIG } from '../../const/config';

export class AgSurveyTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'SEA Post Purchase Survey Trigger',
		name: 'agSurveyTrigger',
		icon: 'file:agsurvey.svg',
		group: ['trigger'],
		version: 1,
		subtitle: 'Trigger on survey responses',
		description: 'Starts the workflow when a survey response is created',
		defaults: {
			name: 'SEA Post Purchase Survey Trigger',
		},
		inputs: [],
		outputs: [NodeConnectionTypes.Main],
		credentials: [
			{
				name: 'agSurveyApi',
				required: true,
			},
		],
		webhooks: [
			{
				name: 'default',
				httpMethod: 'POST',
				responseMode: 'onReceived',
				path: 'webhook',
			},
		],
		properties: [
			{
				displayName: 'Event',
				name: 'event',
				type: 'options',
				options: [
					{
						name: 'Response Created',
						value: 'response.created',
						description: 'Triggered when a new survey response is submitted',
					},
				],
				default: 'response.created',
				description: 'The event type to listen for',
			},
		],
		usableAsTool: true,
	};

	webhookMethods = {
		default: {
			async checkExists(this: IHookFunctions): Promise<boolean> {
				const webhookUrl = this.getNodeWebhookUrl('default');
				const event = this.getNodeParameter('event') as string;

				const options: IHttpRequestOptions = {
					method: 'GET',
					baseURL: CONFIG.API_URLS.PRODUCTION,
					url: '/n8n/shop/status',
				};

				try {
					const response = (await this.helpers.httpRequestWithAuthentication.call(
						this,
						'agSurveyApi',
						options,
					)) as IDataObject;

					const subscriptions = (response.subscriptions as IDataObject[]) || [];
					const webhookData = this.getWorkflowStaticData('node');

					const existingSub = subscriptions.find(
						(sub) => sub.targetUrl === webhookUrl && sub.event === event && sub.isActive,
					);

					if (existingSub) {
						webhookData.subscriptionId = existingSub.id;
						return true;
					}

					return false;
				} catch (error) {
					throw new NodeApiError(this.getNode(), error as JsonObject);
				}
			},

			async create(this: IHookFunctions): Promise<boolean> {
				const webhookUrl = this.getNodeWebhookUrl('default');
				const event = this.getNodeParameter('event') as string;

				const options: IHttpRequestOptions = {
					method: 'POST',
					baseURL: CONFIG.API_URLS.PRODUCTION,
					url: '/n8n/webhooks',
					body: {
						targetUrl: webhookUrl,
						event,
						isActive: true,
					},
				};

				try {
					const response = (await this.helpers.httpRequestWithAuthentication.call(
						this,
						'agSurveyApi',
						options,
					)) as IDataObject;

					if (response.success && response.subscriptionId) {
						const webhookData = this.getWorkflowStaticData('node');
						webhookData.subscriptionId = response.subscriptionId;
						return true;
					}

					return false;
				} catch (error) {
					throw new NodeApiError(this.getNode(), error as JsonObject);
				}
			},

			async delete(this: IHookFunctions): Promise<boolean> {
				const webhookData = this.getWorkflowStaticData('node');
				const subscriptionId = webhookData.subscriptionId as string;

				if (!subscriptionId) {
					return true;
				}

				try {
					const webhookUrl = this.getNodeWebhookUrl('default');

					const options: IHttpRequestOptions = {
						method: 'DELETE',
						baseURL: CONFIG.API_URLS.PRODUCTION,
						url: '/n8n/webhooks',
						body: {
							targetUrl: webhookUrl,
						},
					};

					await this.helpers.httpRequestWithAuthentication.call(this, 'agSurveyApi', options);
					delete webhookData.subscriptionId;
					return true;
				} catch (error) {
					delete webhookData.subscriptionId;
					throw new NodeApiError(this.getNode(), error as JsonObject);
				}
			},
		},
	};

	async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
		const bodyData = this.getBodyData();

		return {
			workflowData: [this.helpers.returnJsonArray([bodyData as IDataObject])],
		};
	}
}
