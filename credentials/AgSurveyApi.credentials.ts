import type {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';
import { CONFIG } from '../const/config';

export class AgSurveyApi implements ICredentialType {
	name = 'agSurveyApi';

	displayName = 'SEA Post Purchase Survey API';

	icon = 'file:agsurvey.svg' as const;

	documentationUrl = 'https://github.com/nguyenvanlinh1902/n8n-nodes-sea-post-purchase-survey#credentials';

	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			required: true,
			description: 'Your SEA Post Purchase Survey API key. Generate from Integrations > n8n page.',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				'x-api-key': '={{$credentials.apiKey}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: CONFIG.API_URLS.PRODUCTION,
			url: '/n8n/shop/status',
			method: 'GET',
		},
	};
}
