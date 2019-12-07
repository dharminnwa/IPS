CREATE TABLE [dbo].[AnswerType] (
    [Id]       INT            IDENTITY (1, 1) NOT NULL,
    [TypeName] NVARCHAR (100) NULL,
    CONSTRAINT [PK_AnswerTypes] PRIMARY KEY CLUSTERED ([Id] ASC)
);

