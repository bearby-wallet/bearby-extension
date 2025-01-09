<script lang="ts">
	import { tick, onMount } from "svelte";
	import { push } from 'popup/routers/navigation'
	import { _ } from "popup/i18n";
	import { linksExpand } from "popup/mixins/link";
	import { unlockWallet } from "popup/backend/wallet";

	let inputEl: HTMLInputElement | undefined;
	let password = $state("");
	let error = $state("")
	let loading = $state(false);
	let disabled = $derived(loading || !password);

	onMount(() => {
		if (inputEl && inputEl.focus) {
			inputEl.focus();
		}
	});

	const handleInput = () => {
		error = "";
	};
	const handleBlur = async () => {
		await tick();

		if (inputEl && inputEl.focus) {
			inputEl.focus();
		}
	};

	const handleSubmit = async (e: Event) => {
		e.preventDefault();

		try {
			loading = true;
			const state = await unlockWallet(password);

			if (state.guard.isEnable && state.guard.isReady) {
				loading = false;

				push("/");
			}
		} catch (err) {
			error = `${$_("lock.error")}-(${(err as Error).message})`;
		}
		loading = false;
	};
</script>

<main>
	<img src="/imgs/logo.webp" alt="logo" />
	<h1>
		{$_("lock.title")}
	</h1>
	<form onsubmit={handleSubmit}>
		<label>
			<input
				bind:this={inputEl}
				bind:value={password}
				class:error={Boolean(error)}
				type="password"
				autocomplete="off"
				placeholder={$_("lock.placeholder")}
				required
				onblur={handleBlur}
				oninput={handleInput}
			/>
		</label>
		<button 
      type="submit"
      class="outline" 
      class:loading 
      disabled={Boolean(disabled || error)} 
      aria-label="unlock"
    >
      {$_("lock.restore")}
    </button>
    <button 
      type="button"
      onclick={() => linksExpand("/start")} 
      aria-label="Go back"
      class="restore-button"
    >
      {$_("lock.restore")}
    </button>
	</form>
</main>

<style lang="scss">
	@use '../styles/mixins' as mix;

	h1 {
		color: var(--text-color);
		font-size: 22pt;
		text-align: center;
	}
	span {
		cursor: pointer;
		margin-block-start: 16px;
		font-size: 10pt;
		color: var(--muted-color);

		&:hover {
			color: var(--primary-color);
		}
	}
	img {
		max-width: 500px;
		width: calc(100vw - 90px);
	}
	main {
		background: inherit;
		height: 100vh;

		@include mix.flex-center-column;
	}
	label {
		width: inherit;
		& > input.error {
			outline-color: var(--danger-color);
			animation: shake 0.4s linear;
		}
	}
	button {
		margin-top: 12px;
	}
	form {
		width: 290px;
		@include mix.flex-center-column;
	}

	.restore-button {
    cursor: pointer;
    margin-block-start: 16px;
    font-size: 10pt;
    color: var(--muted-color);
    background: none;
    border: none;
    padding: 0;

    &:hover {
      color: var(--primary-color);
    }
  }
</style>
