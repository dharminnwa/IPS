CREATE TABLE [dbo].[Questions] (
    [Id]               INT            IDENTITY (1, 1) NOT NULL,
    [QuestionText]     NVARCHAR (500) NOT NULL,
    [Description]      NVARCHAR (MAX) NULL,
    [AnswerTypeId]     INT            NOT NULL,
    [IsActive]         BIT            CONSTRAINT [DF_Questions_IsActive] DEFAULT ((0)) NOT NULL,
    [IsTemplate]       BIT            CONSTRAINT [DF_Questions_IsTemplate] DEFAULT ((0)) NOT NULL,
    [OrganizationId]   INT            NULL,
    [ProfileTypeId]    INT            NULL,
    [ScaleId]          INT            NULL,
    [QuestionSettings] NVARCHAR (MAX) NULL,
    [StructureLevelId] INT            NULL,
    [IndustryId]       INT            NULL,
    [SeqNo]            INT            NULL,
    [Points]           INT            NULL,
    [TimeForQuestion]  INT            NULL,
    [ParentQuestionId] INT            NULL,
    CONSTRAINT [PK_Questions] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_Questions_AnswerTypes] FOREIGN KEY ([AnswerTypeId]) REFERENCES [dbo].[AnswerType] ([Id]),
    CONSTRAINT [FK_Questions_Industries] FOREIGN KEY ([IndustryId]) REFERENCES [dbo].[Industries] ([Id]),
    CONSTRAINT [FK_Questions_Organizations] FOREIGN KEY ([OrganizationId]) REFERENCES [dbo].[Organizations] ([Id]),
    CONSTRAINT [FK_Questions_ProfileTypes] FOREIGN KEY ([ProfileTypeId]) REFERENCES [dbo].[ProfileTypes] ([Id]),
    CONSTRAINT [FK_Questions_Scales] FOREIGN KEY ([ScaleId]) REFERENCES [dbo].[Scales] ([Id]),
    CONSTRAINT [FK_Questions_StructureLevels] FOREIGN KEY ([StructureLevelId]) REFERENCES [dbo].[StructureLevels] ([Id])
);



