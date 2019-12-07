CREATE TABLE [dbo].[Operations] (
    [Id]          INT          IDENTITY (1, 1) NOT NULL,
    [Name]        VARCHAR (50) NOT NULL,
    [IsPageLevel] BIT          CONSTRAINT [DF_Operations_IsPageLevle] DEFAULT ((0)) NOT NULL,
    CONSTRAINT [PK_Operations] PRIMARY KEY CLUSTERED ([Id] ASC)
);



