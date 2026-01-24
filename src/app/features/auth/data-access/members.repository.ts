import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/api/api.service';
import { IFinanceMember } from '../../../shared/models/finance-member.model';

type CreateMemberInput = {
    username: string;
    email: string;
    passwordHash: string;
};

@Injectable({ providedIn: 'root' })
export class MembersRepository {
    private api = inject(ApiService);

    findByUsername(username: string): Observable<IFinanceMember[]> {
        const safe = username.replace(/'/g, "\\'");
        return this.api.get<IFinanceMember[]>('financeMembers', {
            where: `username='${safe}'`,
            pageSize: 1,
        });
    }

    findByEmail(email: string): Observable<IFinanceMember[]> {
        const safe = email.replace(/'/g, "\\'");
        return this.api.get<IFinanceMember[]>('financeMembers', {
            where: `email='${safe}'`,
            pageSize: 1,
        });
    }

    createMember(input: CreateMemberInput): Observable<IFinanceMember> {
        return this.api.post<IFinanceMember>('financeMembers', input);
    }
}
