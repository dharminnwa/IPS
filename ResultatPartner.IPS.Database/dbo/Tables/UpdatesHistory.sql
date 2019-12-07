CREATE TABLE [dbo].[UpdatesHistory] (
    [Id]          INT            IDENTITY (1, 1) NOT NULL,
    [Date]        DATETIME       CONSTRAINT [DF_UpdatesHistory_Date] DEFAULT (getdate()) NOT NULL,
    [Description] NVARCHAR (MAX) NULL,
    [Version]     NVARCHAR (100) NULL,
    CONSTRAINT [PK_UpdatesHistory] PRIMARY KEY CLUSTERED ([Id] ASC)
);

