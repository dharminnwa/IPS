CREATE TABLE [dbo].[LookupItems] (
    [Id]             INT            IDENTITY (1, 1) NOT NULL,
    [LookupItemType] NVARCHAR (25)  NULL,
    [Name]           NVARCHAR (250) NULL,
    [Description]    NVARCHAR (MAX) NULL,
    CONSTRAINT [PK_LookupItems] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [UQ_Columns] UNIQUE NONCLUSTERED ([LookupItemType] ASC, [Name] ASC)
);

