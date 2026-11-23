<script lang="ts">
    import { onMount } from 'svelte';
    import type { RuntimeLinkMetadata } from '#lib/typescript/data/runtime/index.js';

    type PopupMode = 'full' | 'description';
    type PopupDetail = {
        link: RuntimeLinkMetadata;
        href: string;
        displayHref: string;
        mode: PopupMode;
        trigger: HTMLElement;
        id: string;
        source: 'hover' | 'focus';
    };
    type PopupEvent = CustomEvent<PopupDetail>;

    let popup = $state<PopupDetail | null>(null);
    let visible = $state(false);
    let popupElement = $state<HTMLElement>();
    let closeTimer: ReturnType<typeof setTimeout> | undefined;
    let openTimer: ReturnType<typeof setTimeout> | undefined;

    function clearCloseTimer(): void {
        if (closeTimer) {
            clearTimeout(closeTimer);
            closeTimer = undefined;
        }
    }

    function clearOpenTimer(): void {
        if (openTimer) {
            clearTimeout(openTimer);
            openTimer = undefined;
        }
    }

    function positionPopup(): void {
        const currentPopup = popup;
        const element = popupElement;

        if (!currentPopup || !element) return;

        requestAnimationFrame(() => {
            const triggerRect = currentPopup.trigger.getBoundingClientRect();
            const popupRect = element.getBoundingClientRect();
            const margin = 12;
            let left =
                currentPopup.mode === 'description' ? triggerRect.right + margin : triggerRect.left;

            if (
                currentPopup.mode === 'description' &&
                left + popupRect.width > window.innerWidth - margin
            ) {
                left = triggerRect.left - popupRect.width - margin;
            }

            left = Math.max(margin, Math.min(left, window.innerWidth - popupRect.width - margin));
            let top =
                currentPopup.mode === 'description'
                    ? triggerRect.top + triggerRect.height / 2 - popupRect.height / 2
                    : triggerRect.bottom;

            if (top + popupRect.height > window.innerHeight - margin) {
                top = triggerRect.top - popupRect.height;
            }

            element.style.left = `${Math.max(margin, left)}px`;
            element.style.top = `${Math.max(margin, top)}px`;
        });
    }

    function show(detail: PopupDetail): void {
        clearCloseTimer();
        clearOpenTimer();
        const display = (): void => {
            popup = detail;
            visible = true;
            positionPopup();
        };

        if (detail.mode === 'description' && detail.source === 'hover') {
            openTimer = setTimeout(display, 275);
        } else {
            display();
        }
    }

    function scheduleClose(): void {
        clearOpenTimer();
        clearCloseTimer();
        closeTimer = setTimeout(() => {
            visible = false;
        }, 150);
    }

    function handleOpen(event: Event): void {
        show((event as PopupEvent).detail);
    }

    function handleClose(event: Event): void {
        const detail = (event as CustomEvent<{ relatedTarget?: EventTarget | null }>).detail;
        if (detail?.relatedTarget && popupElement?.contains(detail.relatedTarget as Node)) return;
        scheduleClose();
    }

    function handlePopupEnter(): void {
        clearCloseTimer();
    }

    function handlePopupLeave(): void {
        scheduleClose();
    }

    function handleWindowChange(): void {
        if (visible) positionPopup();
    }

    function getDescription(link: RuntimeLinkMetadata): string {
        return link.descriptions?.short ?? link.description;
    }

    onMount(() => {
        window.addEventListener('dnd-portal:popup-open', handleOpen);
        window.addEventListener('dnd-portal:popup-close', handleClose);
        window.addEventListener('resize', handleWindowChange);
        window.addEventListener('scroll', handleWindowChange, true);

        return () => {
            window.removeEventListener('dnd-portal:popup-open', handleOpen);
            window.removeEventListener('dnd-portal:popup-close', handleClose);
            window.removeEventListener('resize', handleWindowChange);
            window.removeEventListener('scroll', handleWindowChange, true);
        };
    });
</script>

<span
    id="wiki-shared-popup"
    bind:this={popupElement}
    class="popup"
    class:popup--full={popup?.mode === 'full'}
    class:popup--description={popup?.mode === 'description'}
    class:popup--visible={visible}
    role={popup?.mode === 'full' ? 'dialog' : 'tooltip'}
    aria-label={popup?.mode === 'full' ? `Preview ${popup.link.title}` : undefined}
    aria-hidden={visible ? undefined : 'true'}
    data-nosnippet
    onmouseenter={handlePopupEnter}
    onmouseleave={handlePopupLeave}
>
    {#if popup?.mode === 'full'}
        <span class="popup__top">
            <img
                class="popup__top-img"
                class:popup__top-img--white={popup.link.img.href.includes('/icons/white/')}
                src={popup.link.img.href}
                alt={popup.link.img.alt}
            />
            <span class="popup__top__header">
                <span class="popup__top__header-title">{popup.link.title}</span>
                <span class="popup__top__header-subtitle">{popup.link.subTitle}</span>
            </span>
        </span>
        <span class="popup-description">{getDescription(popup.link)}</span>
        <span class="popup__link-container">
            Full link:
            <a
                class="popup__link"
                href={popup.href}
                target={popup.link.external ? '_blank' : undefined}
                rel={popup.link.external ? 'noopener noreferrer' : undefined}
            >
                {popup.displayHref}
            </a>
        </span>
    {:else if popup?.mode === 'description'}
        <span class="popup-description">{getDescription(popup.link)}</span>
    {/if}
</span>
