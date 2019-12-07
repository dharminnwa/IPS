CREATE TABLE [dbo].[Resources] (
    [Id]               INT            IDENTITY (1, 1) NOT NULL,
    [Name]             NVARCHAR (100) NOT NULL,
    [ParentResourceId] INT            NULL,
    [IsPage]           BIT            CONSTRAINT [DF_Resources_IsPage] DEFAULT ((0)) NOT NULL,
    CONSTRAINT [PK_Resources] PRIMARY KEY CLUSTERED ([Id] ASC)
);





