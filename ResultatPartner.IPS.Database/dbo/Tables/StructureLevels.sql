CREATE TABLE [dbo].[StructureLevels] (
    [Id]   INT            IDENTITY (1, 1) NOT NULL,
    [Name] NVARCHAR (250) NULL,
    CONSTRAINT [PK_StructureLevels] PRIMARY KEY CLUSTERED ([Id] ASC)
);

