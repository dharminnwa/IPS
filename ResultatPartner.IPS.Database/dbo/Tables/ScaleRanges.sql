CREATE TABLE [dbo].[ScaleRanges] (
    [Id]          INT             IDENTITY (1, 1) NOT NULL,
    [ScaleId]     INT             NOT NULL,
    [Min]         NUMERIC (18, 2) NOT NULL,
    [Max]         NUMERIC (18, 2) NOT NULL,
    [Description] NVARCHAR (100)  NULL,
    [Color]       CHAR (7)        NOT NULL,
    CONSTRAINT [PK_ScaleRanges] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_ScaleRanges_Scales] FOREIGN KEY ([ScaleId]) REFERENCES [dbo].[Scales] ([Id])
);



