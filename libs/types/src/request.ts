import { OpenAIToolkit } from "@pezzo/llm-toolkit";
import { Provider } from "./provider.types";
import { Type } from "class-transformer";
import { AllPrimitiveTypes, Primitive, RecursiveObject } from "./ts-helpers";
import OpenAI from "openai";
import { Anthropic } from '@anthropic-ai/sdk';
import { PromptExecutionType } from "./prompt-execution-type";

type ExtractModelNames<T> = T extends { model: infer M } ? M : never;
export type OpenAIAcceptedModels = ExtractModelNames<
  Parameters<typeof OpenAIToolkit.calculateGptCost>[0]
>;
export type AnthropicAcceptedModesl = Anthropic.MessageCreateParams['model'];

export type ObservabilityReportProperties = RecursiveObject<Primitive>;
export type ObservabilityReportMetadata = {
  provider: string;
  model: string;
  modelAuthor: string;
  client?: string;
  clientVersion?: string;
  environment: string;
  type: PromptExecutionType;
  [key: string]: AllPrimitiveTypes;
};

export class GenericObservabilityRequestResponseBody {
  [key: string]: AllPrimitiveTypes;
}

export class OpenAIObservabilityRequestBody
  implements Partial<OpenAI.Chat.Completions.ChatCompletion>
{
  model: OpenAIAcceptedModels;
  messages: OpenAI.Chat.CompletionCreateParams["messages"];
  max_tokens: number;
  temperature: number;
  top_p: number;
}

export class AnthropicObservabilityRequestBody
  implements Partial< Anthropic.Messages.Message >
{
  model: AnthropicAcceptedModesl;
  messages: Anthropic.MessageCreateParams['messages'];
  max_tokens: number;
  temperature: number;
  top_p: number;
}

export class OpenAIObservabilityResponseBody
  implements OpenAI.Chat.Completions.ChatCompletion
{
  object: OpenAI.Chat.Completions.ChatCompletion["object"];
  id: string;
  created: number;
  model: OpenAIAcceptedModels;
  choices: OpenAI.Chat.Completions.ChatCompletion["choices"];
  completion: string;
  stream: boolean;
  stop: string;
  usage?: OpenAI.Chat.Completions.ChatCompletion["usage"];
  error?: AllPrimitiveTypes;
}

export class AnthropicObservabilityResponseBody
  implements Partial< Anthropic.Message > 
{
  id: string;
  type: 'message';
  role: 'assistant';
  content: Array<Anthropic.ContentBlock>;
  model: AnthropicAcceptedModesl;
  stop_reason: 'end_turn' | 'max_tokens' | 'stop_sequence' | 'tool_use' | null;
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
  error?: AllPrimitiveTypes;
}

export class ObservabilityRequest<
  TProviderType extends Provider | unknown = unknown
> {
  timestamp: string;
  @Type((opts) => {
    switch (opts?.object["provider"]) {
      case Provider.OpenAI:
        return OpenAIObservabilityRequestBody;
      case Provider.Anthropic:
        return AnthropicObservabilityRequestBody;
      default:
        return GenericObservabilityRequestResponseBody;
    }
  })
  body: TProviderType extends Provider.OpenAI
    ? OpenAIObservabilityRequestBody
    : TProviderType extends Provider.Anthropic
    ? AnthropicObservabilityRequestBody
    : GenericObservabilityRequestResponseBody;
}

export class ObservabilityResponse<
  TProviderType extends Provider | unknown = unknown
> {
  timestamp: string;
  @Type((opts) => {
    switch (opts?.object["provider"]) {
      case Provider.OpenAI:
        return OpenAIObservabilityResponseBody;
      case Provider.Anthropic:
        return AnthropicObservabilityResponseBody;
      default:
        return GenericObservabilityRequestResponseBody;
    }
  })
  body: TProviderType extends Provider.OpenAI
    ? OpenAIObservabilityResponseBody
    : TProviderType extends Provider.Anthropic
    ? AnthropicObservabilityResponseBody
    : GenericObservabilityRequestResponseBody;
  status: number;
}

export interface ObservabilityResponseBody {
  usage: string;
  [key: string]: AllPrimitiveTypes;
}