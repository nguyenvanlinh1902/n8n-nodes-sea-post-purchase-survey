# n8n-nodes-sea-post-purchase-survey

This is an n8n community node for the [SEA Post Purchase Survey](https://apps.shopify.com/) Shopify app. It lets you trigger n8n workflows when shoppers submit a survey or quiz response, so you can sync answers to your CRM, send follow-up emails, segment customers, or fan out to any other downstream system.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/reference/license/) workflow automation platform.

[Installation](#installation)
[Operations](#operations)
[Credentials](#credentials)
[Usage](#usage)
[Webhook payload](#webhook-payload)
[Resources](#resources)

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation. The package name on npm is `n8n-nodes-sea-post-purchase-survey`.

In a self-hosted n8n instance:

1. Open **Settings → Community Nodes**.
2. Select **Install**.
3. Enter `n8n-nodes-sea-post-purchase-survey` and confirm.

The node will appear as **SEA Post Purchase Survey Trigger** in the trigger node panel.

## Operations

This package provides one trigger node:

### SEA Post Purchase Survey Trigger

Starts a workflow when a configured event fires in your survey app.

| Event | Value | Fires when |
|-------|-------|------------|
| Response Created | `response.created` | A shopper submits a survey or quiz response |

Webhook lifecycle is handled automatically — n8n calls the app's webhook API to register, verify, and remove the subscription as the workflow is activated, tested, or deleted.

## Credentials

The trigger requires a **SEA Post Purchase Survey API** credential.

1. Open the SEA Post Purchase Survey app in your Shopify admin.
2. Navigate to **Integrations → n8n**.
3. Click **Generate API key** and copy the key.
4. In n8n, create a new **SEA Post Purchase Survey API** credential and paste the key into the **API Key** field.

The credential is sent on every request as the `x-api-key` header. Test the credential with the **Test** button — n8n calls `GET /n8n/shop/status` to verify it.

## Usage

1. Add the **SEA Post Purchase Survey Trigger** node to a workflow.
2. Select your **SEA Post Purchase Survey API** credential.
3. Choose the **Event** to listen for (currently `response.created`).
4. Activate the workflow. n8n registers a webhook subscription with the survey app.

Each time a response is submitted, the trigger emits one item containing the response payload. Connect downstream nodes (HTTP Request, Slack, Google Sheets, your CRM, etc.) to do whatever you need with the data.

When the workflow is deactivated or deleted, n8n removes the subscription automatically.

## Webhook payload

The trigger emits the raw event body delivered by the app. A `response.created` event looks roughly like this:

```json
{
  "event": "response.created",
  "shopDomain": "example.myshopify.com",
  "responseId": "abc123",
  "surveyId": "survey_123",
  "surveyTitle": "Post-Purchase Survey",
  "submittedAt": "2026-05-04T10:00:00.000Z",
  "customer": {
    "id": "cust_456",
    "email": "shopper@example.com"
  },
  "order": {
    "id": "order_789",
    "name": "#1001"
  },
  "answers": [
    {
      "questionId": "q1",
      "questionTitle": "How did you hear about us?",
      "type": "single_choice",
      "value": "Friend"
    }
  ]
}
```

Field availability depends on the survey configuration (e.g. `customer` and `order` are only present for post-purchase flows). Use n8n expressions like `{{$json.answers[0].value}}` to consume individual fields downstream.

## Resources

- [n8n community nodes documentation](https://docs.n8n.io/integrations/community-nodes/)
- [SEA Post Purchase Survey App on Shopify](https://apps.shopify.com/)
- [Submit issues or feature requests](https://github.com/nguyenvanlinh1902/n8n-nodes-sea-post-purchase-survey/issues)

## License

[MIT](LICENSE.md) © AVADA Commerce
