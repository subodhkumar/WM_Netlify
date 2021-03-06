import { IDGenerator } from '@wm/core';
import { getAttrMarkup, register } from '@wm/transpiler';
const tagName = 'form';
const idGen = new IDGenerator('wizard_step_id_');
register('wm-wizardstep', () => {
    return {
        pre: attrs => {
            const counter = idGen.nextUid();
            return `<${tagName} wmWizardStep #${counter}="wmWizardStep" ${getAttrMarkup(attrs)}>
                       <ng-template [ngIf]="${counter}.isInitialized">`;
        },
        post: () => `</ng-template></${tagName}>`
    };
});
export default () => { };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2l6YXJkLXN0ZXAuYnVpbGQuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9Ad20vY29tcG9uZW50cy8iLCJzb3VyY2VzIjpbIndpZGdldHMvY29tbW9uL3dpemFyZC93aXphcmQtc3RlcC93aXphcmQtc3RlcC5idWlsZC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0sVUFBVSxDQUFDO0FBQ3ZDLE9BQU8sRUFBRSxhQUFhLEVBQWlCLFFBQVEsRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBRXhFLE1BQU0sT0FBTyxHQUFHLE1BQU0sQ0FBQztBQUN2QixNQUFNLEtBQUssR0FBRyxJQUFJLFdBQVcsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO0FBRWpELFFBQVEsQ0FBQyxlQUFlLEVBQUUsR0FBa0IsRUFBRTtJQUMxQyxPQUFPO1FBQ0gsR0FBRyxFQUFFLEtBQUssQ0FBQyxFQUFFO1lBQ1QsTUFBTSxPQUFPLEdBQUcsS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUFDO1lBQ2hDLE9BQU8sSUFBSSxPQUFPLGtCQUFrQixPQUFPLG1CQUFtQixhQUFhLENBQUMsS0FBSyxDQUFDOzhDQUNoRCxPQUFPLGtCQUFrQixDQUFDO1FBQ2hFLENBQUM7UUFDRCxJQUFJLEVBQUUsR0FBRyxFQUFFLENBQUMsbUJBQW1CLE9BQU8sR0FBRztLQUM1QyxDQUFDO0FBQ04sQ0FBQyxDQUFDLENBQUM7QUFFSCxlQUFlLEdBQUcsRUFBRSxHQUFFLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IElER2VuZXJhdG9yIH0gZnJvbSAnQHdtL2NvcmUnO1xuaW1wb3J0IHsgZ2V0QXR0ck1hcmt1cCwgSUJ1aWxkVGFza0RlZiwgcmVnaXN0ZXIgfSBmcm9tICdAd20vdHJhbnNwaWxlcic7XG5cbmNvbnN0IHRhZ05hbWUgPSAnZm9ybSc7XG5jb25zdCBpZEdlbiA9IG5ldyBJREdlbmVyYXRvcignd2l6YXJkX3N0ZXBfaWRfJyk7XG5cbnJlZ2lzdGVyKCd3bS13aXphcmRzdGVwJywgKCk6IElCdWlsZFRhc2tEZWYgPT4ge1xuICAgIHJldHVybiB7XG4gICAgICAgIHByZTogYXR0cnMgPT4ge1xuICAgICAgICAgICAgY29uc3QgY291bnRlciA9IGlkR2VuLm5leHRVaWQoKTtcbiAgICAgICAgICAgIHJldHVybiBgPCR7dGFnTmFtZX0gd21XaXphcmRTdGVwICMke2NvdW50ZXJ9PVwid21XaXphcmRTdGVwXCIgJHtnZXRBdHRyTWFya3VwKGF0dHJzKX0+XG4gICAgICAgICAgICAgICAgICAgICAgIDxuZy10ZW1wbGF0ZSBbbmdJZl09XCIke2NvdW50ZXJ9LmlzSW5pdGlhbGl6ZWRcIj5gO1xuICAgICAgICB9LFxuICAgICAgICBwb3N0OiAoKSA9PiBgPC9uZy10ZW1wbGF0ZT48LyR7dGFnTmFtZX0+YFxuICAgIH07XG59KTtcblxuZXhwb3J0IGRlZmF1bHQgKCkgPT4ge307XG4iXX0=