CREATE TABLE [dbo].[Cultures] (
    [Id]                INT            IDENTITY (1, 1) NOT NULL,
    [CultureName]       NVARCHAR (20)  NULL,
    [CultureIdentifier] NCHAR (6)      NULL,
    [Region]            NVARCHAR (250) NULL,
    [IsActive]          BIT            CONSTRAINT [DF_Cultures_Status] DEFAULT ((0)) NOT NULL,
    CONSTRAINT [PK_CultureMaster] PRIMARY KEY CLUSTERED ([Id] ASC)
);

