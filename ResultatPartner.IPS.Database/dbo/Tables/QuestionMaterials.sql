CREATE TABLE [dbo].[QuestionMaterials] (
    [QuestionId]   INT            NOT NULL,
    [DocumentId]   UNIQUEIDENTIFIER NULL,
    [MaterialType] INT            NOT NULL,
    [Link]         NVARCHAR (MAX) NULL,
    CONSTRAINT [PK_QuestionMaterials] PRIMARY KEY CLUSTERED ([QuestionId] ASC),
    CONSTRAINT [FK_QuestionMaterials_Questions] FOREIGN KEY ([QuestionId]) REFERENCES [dbo].[Questions] ([Id]),
    CONSTRAINT [FK_QuestionMaterials_Documents] FOREIGN KEY ([DocumentId]) REFERENCES [dbo].[Documents] ([Id])
);