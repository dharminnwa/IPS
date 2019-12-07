CREATE TABLE [dbo].[Link_OrganizationPartners] (
    [OrganizationId]        INT NOT NULL,
    [PartnerOrganizationId] INT NOT NULL,
    CONSTRAINT [PK_OrganizationPartners] PRIMARY KEY CLUSTERED ([OrganizationId] ASC, [PartnerOrganizationId] ASC),
    CONSTRAINT [FK_OrganizationPartners_Organizations] FOREIGN KEY ([PartnerOrganizationId]) REFERENCES [dbo].[Organizations] ([Id]),
    CONSTRAINT [FK_OrganizationPartners_Organizations1] FOREIGN KEY ([OrganizationId]) REFERENCES [dbo].[Organizations] ([Id])
);

