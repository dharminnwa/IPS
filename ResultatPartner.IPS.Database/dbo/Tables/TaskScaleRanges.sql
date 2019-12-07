CREATE TABLE [dbo].[TaskScaleRanges] (
    [Id]           INT             IDENTITY (1, 1) NOT NULL,
    [TaskScalesId] INT             NOT NULL,
    [Min]          NUMERIC (18, 2) NOT NULL,
    [Max]          NUMERIC (18, 2) NOT NULL,
    [Description]  NVARCHAR (100)  NULL,
    [Color]        CHAR (7)        NOT NULL,
    CONSTRAINT [PK_TaskScaleRanges] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_TaskScaleRanges_TaskScales] FOREIGN KEY ([TaskScalesId]) REFERENCES [dbo].[TaskScales] ([Id])
);

