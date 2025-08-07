/**
* This file was @generated using pocketbase-typegen
*/

import type PocketBase from 'pocketbase'
import type { RecordService } from 'pocketbase'

export enum Collections {
	Authorigins = "_authOrigins",
	Externalauths = "_externalAuths",
	Mfas = "_mfas",
	Otps = "_otps",
	Superusers = "_superusers",
	Agents = "agents",
	Chats = "chats",
	Documents = "documents",
	Feedbacks = "feedbacks",
	Integrations = "integrations",
	Leads = "leads",
	Messages = "messages",
	Notifications = "notifications",
	OrgMembers = "orgMembers",
	Orgs = "orgs",
	Projects = "projects",
	Rooms = "rooms",
	Sources = "sources",
	Subscriptions = "subscriptions",
	Tickets = "tickets",
	Users = "users",
}

// Alias types for improved usability
export type IsoDateString = string
export type RecordIdString = string
export type HTMLString = string

type ExpandType<T> = unknown extends T
	? T extends unknown
		? { expand?: unknown }
		: { expand: T }
	: { expand: T }

// System fields
export type BaseSystemFields<T = unknown> = {
	id: RecordIdString
	collectionId: string
	collectionName: Collections
} & ExpandType<T>

export type AuthSystemFields<T = unknown> = {
	email: string
	emailVisibility: boolean
	username: string
	verified: boolean
} & BaseSystemFields<T>

// Record types for each collection

export type AuthoriginsRecord = {
	collectionRef: string
	created?: IsoDateString
	fingerprint: string
	id: string
	recordRef: string
	updated?: IsoDateString
}

export type ExternalauthsRecord = {
	collectionRef: string
	created?: IsoDateString
	id: string
	provider: string
	providerId: string
	recordRef: string
	updated?: IsoDateString
}

export type MfasRecord = {
	collectionRef: string
	created?: IsoDateString
	id: string
	method: string
	recordRef: string
	updated?: IsoDateString
}

export type OtpsRecord = {
	collectionRef: string
	created?: IsoDateString
	id: string
	password: string
	recordRef: string
	sentTo?: string
	updated?: IsoDateString
}

export type SuperusersRecord = {
	created?: IsoDateString
	email: string
	emailVisibility?: boolean
	id: string
	password: string
	tokenKey: string
	updated?: IsoDateString
	verified?: boolean
}

export enum AgentsProviderOptions {
	"openai" = "openai",
	"anthropic" = "anthropic",
	"google" = "google",
}
export type AgentsRecord = {
	avatar?: string
	created?: IsoDateString
	id: string
	name?: string
	project?: RecordIdString
	provider?: AgentsProviderOptions
	system?: string
	updated?: IsoDateString
}

export enum ChatsTypeOptions {
	"web" = "web",
	"tg" = "tg",
}
export type ChatsRecord<Ttheme = unknown> = {
	avatar?: string
	created?: IsoDateString
	domain?: string
	firstMessage?: string
	id: string
	integration?: RecordIdString
	name?: string
	project?: RecordIdString
	tgToken?: string
	theme?: null | Ttheme
	type?: ChatsTypeOptions
	updated?: IsoDateString
}

export enum DocumentsStatusOptions {
	"indexed" = "indexed",
	"error" = "error",
	"unsynced" = "unsynced",
	"indexing" = "indexing",
	"crawling" = "crawling",
	"reading" = "reading",
	"idle" = "idle",
}

export enum DocumentsTypeOptions {
	"file" = "file",
	"webPage" = "webPage",
	"manual" = "manual",
}
export type DocumentsRecord<Tmetadata = unknown> = {
	chunkCount?: number
	content?: string
	created?: IsoDateString
	file?: string
	id: string
	metadata?: null | Tmetadata
	source?: RecordIdString
	status?: DocumentsStatusOptions
	title?: string
	tokenCount?: number
	type?: DocumentsTypeOptions
	updated?: IsoDateString
	url?: string
}

export enum FeedbacksTypeOptions {
	"support" = "support",
	"idea" = "idea",
}
export type FeedbacksRecord<Tmetadata = unknown> = {
	content?: string
	created?: IsoDateString
	id: string
	metadata?: null | Tmetadata
	type: FeedbacksTypeOptions
	updated?: IsoDateString
	user?: RecordIdString
}

export type IntegrationsRecord = {
	agents?: RecordIdString[]
	created?: IsoDateString
	id: string
	name?: string
	operators?: RecordIdString[]
	project?: RecordIdString
	sources?: RecordIdString[]
	updated?: IsoDateString
}

export enum LeadsTypeOptions {
	"cold" = "cold",
	"warm" = "warm",
	"hot" = "hot",
	"client" = "client",
}
export type LeadsRecord<Tmetadata = unknown> = {
	created?: IsoDateString
	description?: string
	email?: string
	id: string
	metadata?: null | Tmetadata
	name?: string
	phone?: string
	tg?: string
	type?: LeadsTypeOptions
	updated?: IsoDateString
}

export enum MessagesRoleOptions {
	"user" = "user",
	"operator" = "operator",
	"assistant" = "assistant",
	"system" = "system",
	"tool" = "tool",
}

export enum MessagesEventOptions {
	"operatorConnected" = "operatorConnected",
	"operatorDisconnected" = "operatorDisconnected",
	"message" = "message",
	"updateLead" = "updateLead",
	"createTicket" = "createTicket",
	"callOperator" = "callOperator",
	"callSearchChain" = "callSearchChain",
}
export type MessagesRecord<Tmetadata = unknown> = {
	content: string
	contentTokensCount?: number
	created?: IsoDateString
	event?: MessagesEventOptions
	id: string
	metadata?: null | Tmetadata
	role: MessagesRoleOptions
	room: RecordIdString
	sentBy: string
	visible?: boolean
}

export enum NotificationsTypeOptions {
	"dummy" = "dummy",
	"indexing" = "indexing",
	"orgInvite" = "orgInvite",
}
export type NotificationsRecord<Tpayload = unknown> = {
	created?: IsoDateString
	hideAfter?: IsoDateString
	id: string
	payload?: null | Tpayload
	read?: IsoDateString
	type?: NotificationsTypeOptions
	updated?: IsoDateString
	user?: RecordIdString
	visible?: boolean
}

export enum OrgMembersRoleOptions {
	"owner" = "owner",
	"operator" = "operator",
}
export type OrgMembersRecord = {
	created?: IsoDateString
	id: string
	org?: RecordIdString
	role: OrgMembersRoleOptions
	updated?: IsoDateString
}

export enum OrgsEarlyAdopterOptions {
	"Lite" = "Lite",
	"Plus" = "Plus",
	"Pro" = "Pro",
	"Business" = "Business",
	"Free" = "Free",
}
export type OrgsRecord = {
	created?: IsoDateString
	earlyAdopter?: OrgsEarlyAdopterOptions
	id: string
	name: string
	subscription?: RecordIdString
	updated?: IsoDateString
}

export type ProjectsRecord = {
	created?: IsoDateString
	id: string
	name?: string
	org?: RecordIdString
	updated?: IsoDateString
}

export enum RoomsStatusOptions {
	"auto" = "auto",
	"operator" = "operator",
	"waitingOperator" = "waitingOperator",
	"preview" = "preview",
	"seeded" = "seeded",
}
export type RoomsRecord = {
	chat?: RecordIdString
	created?: IsoDateString
	id: string
	lead?: RecordIdString
	name?: string
	status: RoomsStatusOptions
	updated?: IsoDateString
}

export type SourcesRecord<Tmetadata = unknown> = {
	created?: IsoDateString
	id: string
	metadata?: null | Tmetadata
	name?: string
	project?: RecordIdString
	updated?: IsoDateString
}

export enum SubscriptionsTierOptions {
	"Free" = "Free",
	"Lite" = "Lite",
	"Plus" = "Plus",
	"Pro" = "Pro",
	"Business" = "Business",
	"PAYG" = "PAYG",
}
export type SubscriptionsRecord<TusagePayload = unknown> = {
	created?: IsoDateString
	ended?: IsoDateString
	gas?: number
	id: string
	subscribed?: IsoDateString
	thaliaGas?: number
	tier?: SubscriptionsTierOptions
	updated?: IsoDateString
	usagePayload?: null | TusagePayload
}

export enum TicketsPriorityOptions {
	"low" = "low",
	"high" = "high",
	"medium" = "medium",
}
export type TicketsRecord<Tmetadata = unknown> = {
	created?: IsoDateString
	description?: string
	id: string
	message?: RecordIdString
	metadata?: null | Tmetadata
	priority?: TicketsPriorityOptions
	title?: string
	updated?: IsoDateString
}

export type UsersRecord<Tmetadata = unknown> = {
	avatar?: string
	created?: IsoDateString
	email?: string
	emailVisibility?: boolean
	id: string
	metadata?: null | Tmetadata
	name?: string
	orgMembers?: RecordIdString[]
	password: string
	tokenKey: string
	updated?: IsoDateString
	verified?: boolean
}

// Response types include system fields and match responses from the PocketBase API
export type AuthoriginsResponse<Texpand = unknown> = Required<AuthoriginsRecord> & BaseSystemFields<Texpand>
export type ExternalauthsResponse<Texpand = unknown> = Required<ExternalauthsRecord> & BaseSystemFields<Texpand>
export type MfasResponse<Texpand = unknown> = Required<MfasRecord> & BaseSystemFields<Texpand>
export type OtpsResponse<Texpand = unknown> = Required<OtpsRecord> & BaseSystemFields<Texpand>
export type SuperusersResponse<Texpand = unknown> = Required<SuperusersRecord> & AuthSystemFields<Texpand>
export type AgentsResponse<Texpand = unknown> = Required<AgentsRecord> & BaseSystemFields<Texpand>
export type ChatsResponse<Ttheme = unknown, Texpand = unknown> = Required<ChatsRecord<Ttheme>> & BaseSystemFields<Texpand>
export type DocumentsResponse<Tmetadata = unknown, Texpand = unknown> = Required<DocumentsRecord<Tmetadata>> & BaseSystemFields<Texpand>
export type FeedbacksResponse<Tmetadata = unknown, Texpand = unknown> = Required<FeedbacksRecord<Tmetadata>> & BaseSystemFields<Texpand>
export type IntegrationsResponse<Texpand = unknown> = Required<IntegrationsRecord> & BaseSystemFields<Texpand>
export type LeadsResponse<Tmetadata = unknown, Texpand = unknown> = Required<LeadsRecord<Tmetadata>> & BaseSystemFields<Texpand>
export type MessagesResponse<Tmetadata = unknown, Texpand = unknown> = Required<MessagesRecord<Tmetadata>> & BaseSystemFields<Texpand>
export type NotificationsResponse<Tpayload = unknown, Texpand = unknown> = Required<NotificationsRecord<Tpayload>> & BaseSystemFields<Texpand>
export type OrgMembersResponse<Texpand = unknown> = Required<OrgMembersRecord> & BaseSystemFields<Texpand>
export type OrgsResponse<Texpand = unknown> = Required<OrgsRecord> & BaseSystemFields<Texpand>
export type ProjectsResponse<Texpand = unknown> = Required<ProjectsRecord> & BaseSystemFields<Texpand>
export type RoomsResponse<Texpand = unknown> = Required<RoomsRecord> & BaseSystemFields<Texpand>
export type SourcesResponse<Tmetadata = unknown, Texpand = unknown> = Required<SourcesRecord<Tmetadata>> & BaseSystemFields<Texpand>
export type SubscriptionsResponse<TusagePayload = unknown, Texpand = unknown> = Required<SubscriptionsRecord<TusagePayload>> & BaseSystemFields<Texpand>
export type TicketsResponse<Tmetadata = unknown, Texpand = unknown> = Required<TicketsRecord<Tmetadata>> & BaseSystemFields<Texpand>
export type UsersResponse<Tmetadata = unknown, Texpand = unknown> = Required<UsersRecord<Tmetadata>> & AuthSystemFields<Texpand>

// Types containing all Records and Responses, useful for creating typing helper functions

export type CollectionRecords = {
	_authOrigins: AuthoriginsRecord
	_externalAuths: ExternalauthsRecord
	_mfas: MfasRecord
	_otps: OtpsRecord
	_superusers: SuperusersRecord
	agents: AgentsRecord
	chats: ChatsRecord
	documents: DocumentsRecord
	feedbacks: FeedbacksRecord
	integrations: IntegrationsRecord
	leads: LeadsRecord
	messages: MessagesRecord
	notifications: NotificationsRecord
	orgMembers: OrgMembersRecord
	orgs: OrgsRecord
	projects: ProjectsRecord
	rooms: RoomsRecord
	sources: SourcesRecord
	subscriptions: SubscriptionsRecord
	tickets: TicketsRecord
	users: UsersRecord
}

export type CollectionResponses = {
	_authOrigins: AuthoriginsResponse
	_externalAuths: ExternalauthsResponse
	_mfas: MfasResponse
	_otps: OtpsResponse
	_superusers: SuperusersResponse
	agents: AgentsResponse
	chats: ChatsResponse
	documents: DocumentsResponse
	feedbacks: FeedbacksResponse
	integrations: IntegrationsResponse
	leads: LeadsResponse
	messages: MessagesResponse
	notifications: NotificationsResponse
	orgMembers: OrgMembersResponse
	orgs: OrgsResponse
	projects: ProjectsResponse
	rooms: RoomsResponse
	sources: SourcesResponse
	subscriptions: SubscriptionsResponse
	tickets: TicketsResponse
	users: UsersResponse
}

// Type for usage with type asserted PocketBase instance
// https://github.com/pocketbase/js-sdk#specify-typescript-definitions

export type TypedPocketBase = PocketBase & {
	collection(idOrName: '_authOrigins'): RecordService<AuthoriginsResponse>
	collection(idOrName: '_externalAuths'): RecordService<ExternalauthsResponse>
	collection(idOrName: '_mfas'): RecordService<MfasResponse>
	collection(idOrName: '_otps'): RecordService<OtpsResponse>
	collection(idOrName: '_superusers'): RecordService<SuperusersResponse>
	collection(idOrName: 'agents'): RecordService<AgentsResponse>
	collection(idOrName: 'chats'): RecordService<ChatsResponse>
	collection(idOrName: 'documents'): RecordService<DocumentsResponse>
	collection(idOrName: 'feedbacks'): RecordService<FeedbacksResponse>
	collection(idOrName: 'integrations'): RecordService<IntegrationsResponse>
	collection(idOrName: 'leads'): RecordService<LeadsResponse>
	collection(idOrName: 'messages'): RecordService<MessagesResponse>
	collection(idOrName: 'notifications'): RecordService<NotificationsResponse>
	collection(idOrName: 'orgMembers'): RecordService<OrgMembersResponse>
	collection(idOrName: 'orgs'): RecordService<OrgsResponse>
	collection(idOrName: 'projects'): RecordService<ProjectsResponse>
	collection(idOrName: 'rooms'): RecordService<RoomsResponse>
	collection(idOrName: 'sources'): RecordService<SourcesResponse>
	collection(idOrName: 'subscriptions'): RecordService<SubscriptionsResponse>
	collection(idOrName: 'tickets'): RecordService<TicketsResponse>
	collection(idOrName: 'users'): RecordService<UsersResponse>
}
