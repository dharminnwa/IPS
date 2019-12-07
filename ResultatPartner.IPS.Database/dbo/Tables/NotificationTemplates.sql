CREATE TABLE [dbo].[NotificationTemplates] (
    [Id]                         INT            IDENTITY (1, 1) NOT NULL,
    [Name]                       NVARCHAR (50)  NOT NULL,
    [CultureId]                  INT            NOT NULL,
    [EmailSubject]               NVARCHAR (250) NULL,
    [EmailBody]                  NVARCHAR (MAX) NULL,
    [SMSMessage]                 NVARCHAR (MAX) NULL,
    [EvaluationRoleId]           INT            NULL,
    [UIMessage]                  NVARCHAR (MAX) NULL,
    [StageTypeId]                INT            NULL,
    [OrganizationId]             INT            NULL,
    [NotificationTemplateTypeId] INT            NULL,
    [CreatedBy]                  INT            NULL,
    [CreatedOn]                  DATETIME       NULL,
    [ModifiedBy]                 INT            NULL,
    [ModifiedOn]                 DATETIME       NULL,
    [CreatedAsRoleId]            NVARCHAR (128) NULL,
    [ModifiedAsRoleId]           NVARCHAR (128) NULL,
    [IsDefualt]                  BIT            CONSTRAINT [DF_NotificationTemplates_IsDefualt] DEFAULT ((0)) NOT NULL,
    [StateTypeId]                INT            NULL,
    [ProjectTypeId]              INT            NULL,
    [ProfileTypeId]              INT            NULL,
    CONSTRAINT [PK_NotificationTemplates] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_NotificationTemplates_Cultures] FOREIGN KEY ([CultureId]) REFERENCES [dbo].[Cultures] ([Id]),
    CONSTRAINT [FK_NotificationTemplates_EvaluationRoles] FOREIGN KEY ([EvaluationRoleId]) REFERENCES [dbo].[EvaluationRoles] ([Id]),
    CONSTRAINT [FK_NotificationTemplates_NotificationTemplateTypes] FOREIGN KEY ([NotificationTemplateTypeId]) REFERENCES [dbo].[NotificationTemplateTypes] ([Id]),
    CONSTRAINT [FK_NotificationTemplates_Organizations] FOREIGN KEY ([OrganizationId]) REFERENCES [dbo].[Organizations] ([Id])
);













