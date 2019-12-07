CREATE TABLE [dbo].[ProspectingCustomerResult] (
    [Id]                    INT             IDENTITY (1, 1) NOT NULL,
    [ProspectingCustomerId] INT             NOT NULL,
    [ProspectingActivityId] INT             NOT NULL,
    [SkillId]               INT             NULL,
    [IsDone]                BIT             NOT NULL,
    [Description]           VARCHAR (MAX)   NULL,
    [Duration]              INT             NULL,
    [IsNoMeeting]           BIT             NOT NULL,
    [IsMeeting]             BIT             NOT NULL,
    [IsFollowUp]            BIT             NOT NULL,
    [IsServiceAgreed]       BIT             CONSTRAINT [DF_ProspectingCustomerResult_IsServiceAgreed] DEFAULT ((0)) NOT NULL,
    [ServiceAmount]         NUMERIC (18, 2) CONSTRAINT [DF_ProspectingCustomerResult_ServiceAmount] DEFAULT ((0)) NOT NULL,
    [CustomerInterestRate]  INT             NULL,
    [Reason]                VARCHAR (MAX)   NULL,
    [CreatedOn]             DATETIME        NULL,
    [CreatedBy]             INT             NULL,
    [ModifiedOn]            DATETIME        NULL,
    [ModifiedBy]            INT             NULL,
    [ProspectingType]       INT             CONSTRAINT [DF_ProspectingCustomerResult_ProspectingType] DEFAULT ((0)) NOT NULL,
    [IsSales]               BIT             CONSTRAINT [DF_ProspectingCustomerResult_IsSales] DEFAULT ((0)) NOT NULL,
    [SalesNotification]     NVARCHAR (MAX)  NULL,
    CONSTRAINT [PK_ProspectingCustomerResult] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_ProspectingCustomerResult_ProspectingActivities] FOREIGN KEY ([ProspectingActivityId]) REFERENCES [dbo].[ProspectingActivities] ([Id]),
    CONSTRAINT [FK_ProspectingCustomerResult_ProspectingCustomers] FOREIGN KEY ([ProspectingCustomerId]) REFERENCES [dbo].[ProspectingCustomers] ([Id]),
    CONSTRAINT [FK_ProspectingCustomerResult_Skills] FOREIGN KEY ([SkillId]) REFERENCES [dbo].[Skills] ([Id])
);







